"""
Livestock Disease Syndromic ML & Spatial Outbreak Microservice
FastAPI endpoint for multi-disease triage & DBSCAN spatio-temporal cluster discovery.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import numpy as np
import math

app = FastAPI(
    title="Livestock Disease Syndromic ML Service",
    version="1.0.0",
    description="Dual Engine: OIE/WOAH Syndromic Classifier & DBSCAN Outbreak Cluster Detection"
)

# ----------------------------------------------------------------------
# 1. MODELS & DATA STRUCTURES
# ----------------------------------------------------------------------

class SymptomPayload(BaseModel):
    species: str = Field(default="cow", description="cow, buffalo, goat, sheep, poultry, pig")
    age_category: Optional[str] = Field(default="adult", description="young, adult, old")
    affected_count: int = Field(default=1, ge=1)
    mortality_count: int = Field(default=0, ge=0)
    symptoms: Dict[str, bool] = Field(
        default_factory=dict,
        description="Dictionary of boolean clinical symptoms"
    )

class DifferentialDiagnosis(BaseModel):
    disease_name: str
    probability: float
    severity: str
    urgency_level: str
    recommended_quarantine_days: int
    containment_protocol: str

class PredictionResponse(BaseModel):
    top_prediction: str
    confidence_score: float
    severity: str
    zoonotic_risk: bool
    quarantine_recommended: bool
    top_3_differentials: List[DifferentialDiagnosis]
    contributing_features: List[Dict[str, Any]]
    emergency_action_summary: str

class CoordinatePoint(BaseModel):
    report_id: str
    latitude: float
    longitude: float
    weight: Optional[int] = 1

class ClusterRequest(BaseModel):
    coordinates: List[CoordinatePoint]
    eps_km: float = Field(default=5.0, description="DBSCAN spatial radius in kilometers")
    min_samples: int = Field(default=3, description="Minimum points to form an epidemic cluster")

class ClusterCentroid(BaseModel):
    cluster_id: str
    center_lat: float
    center_lon: float
    radius_km: float
    point_count: int
    total_animals_affected: int
    report_ids: List[str]

class ClusterResponse(BaseModel):
    active_clusters_detected: int
    clusters: List[ClusterCentroid]
    outlier_points_count: int

# ----------------------------------------------------------------------
# 2. SYNDROMIC MULTI-CLASS INFERENCE ENGINE
# ----------------------------------------------------------------------

DISEASE_PROFILES = {
    "Foot-and-Mouth Disease (FMD)": {
        "severity": "CRITICAL",
        "zoonotic": False,
        "quarantine_days": 21,
        "key_symptoms": ["mouth_blisters", "salivation", "hoof_lesions", "high_fever", "lameness"],
        "species": ["cow", "buffalo", "sheep", "goat", "pig"],
        "protocol": "Strict 5km movement restriction. Disinfect premises with 2% sodium carbonate or 1% citric acid."
    },
    "Anthrax": {
        "severity": "ZOONOTIC",
        "zoonotic": True,
        "quarantine_days": 30,
        "key_symptoms": ["sudden_death", "unclotted_blood", "high_fever", "respiratory_distress"],
        "species": ["cow", "buffalo", "sheep", "goat"],
        "protocol": "DO NOT OPEN CARCASS. Deep burial with unslaked lime (minimum 6ft). Notify DVO & Public Health Officer."
    },
    "Lumpy Skin Disease (LSD)": {
        "severity": "MODERATE",
        "zoonotic": False,
        "quarantine_days": 28,
        "key_symptoms": ["skin_nodules", "high_fever", "salivation", "swollen_lymph_nodes"],
        "species": ["cow", "buffalo"],
        "protocol": "Isolate affected animals. Spray sheds with pyrethroid vector repellents. Apply antiseptic neem wash."
    },
    "Peste des Petits Ruminants (PPR)": {
        "severity": "CRITICAL",
        "zoonotic": False,
        "quarantine_days": 21,
        "key_symptoms": ["diarrhea", "nasal_discharge", "mouth_blisters", "high_fever", "respiratory_distress"],
        "species": ["goat", "sheep"],
        "protocol": "Isolate small ruminants. Provide electrolyte rehydration. Restrict communal pasture grazing."
    },
    "Hemorrhagic Septicemia (HS)": {
        "severity": "CRITICAL",
        "zoonotic": False,
        "quarantine_days": 14,
        "key_symptoms": ["high_fever", "respiratory_distress", "salivation", "throat_swelling"],
        "species": ["cow", "buffalo"],
        "protocol": "Immediate broad-spectrum parenteral antibiotics under vet prescription. Dry bedding and drainage."
    },
    "Black Quarter (BQ)": {
        "severity": "CRITICAL",
        "zoonotic": False,
        "quarantine_days": 14,
        "key_symptoms": ["crepitating_swelling", "lameness", "high_fever", "sudden_death"],
        "species": ["cow", "buffalo"],
        "protocol": "Penicillin administration in early phase. Deep burial of dead animals. Restrict boggy pastures."
    },
    "Routine Sickness / Indigestion": {
        "severity": "LOW",
        "zoonotic": False,
        "quarantine_days": 0,
        "key_symptoms": ["loss_of_appetite", "dullness", "mild_fever"],
        "species": ["cow", "buffalo", "goat", "sheep", "poultry", "pig"],
        "protocol": "Supportive fluid and digestive care. Consult local veterinary subcenter."
    }
}

def calculate_disease_scores(payload: SymptomPayload) -> List[Dict[str, Any]]:
    scores = []
    user_symptoms = {k: v for k, v in payload.symptoms.items() if v}
    species = payload.species.lower()

    for disease, profile in DISEASE_PROFILES.items():
        # Species match bonus
        species_multiplier = 1.0 if species in profile["species"] else 0.3
        
        # Match count
        matched = [sym for sym in profile["key_symptoms"] if user_symptoms.get(sym)]
        match_ratio = len(matched) / len(profile["key_symptoms"])

        # Severe indicators
        if disease == "Anthrax" and user_symptoms.get("sudden_death") and user_symptoms.get("unclotted_blood"):
            match_ratio = 1.0
        elif disease == "Foot-and-Mouth Disease (FMD)" and user_symptoms.get("mouth_blisters") and user_symptoms.get("hoof_lesions"):
            match_ratio = max(match_ratio, 0.95)

        raw_score = match_ratio * species_multiplier
        if raw_score > 0.05:
            scores.append({
                "disease": disease,
                "score": raw_score,
                "matched": matched,
                "profile": profile
            })

    if not scores:
        scores.append({
            "disease": "Routine Sickness / Indigestion",
            "score": 0.5,
            "matched": list(user_symptoms.keys()),
            "profile": DISEASE_PROFILES["Routine Sickness / Indigestion"]
        })

    # Softmax normalization
    scores.sort(key=lambda x: x["score"], reverse=True)
    total_score = sum(s["score"] for s in scores[:5]) or 1.0
    for s in scores:
        s["prob"] = round(s["score"] / total_score, 3)

    return scores

# ----------------------------------------------------------------------
# 3. SPATIAL DBSCAN CLUSTERING LOGIC (HAVERSINE)
# ----------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# ----------------------------------------------------------------------
# 4. API ROUTES
# ----------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "FarmShield Livestock Disease Syndromic ML Service",
        "status": "online",
        "endpoints": ["/predict-syndrome", "/detect-clusters", "/health"]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "engine": "FastAPI + WOAH Rule-Matrix"}

@app.post("/predict-syndrome", response_model=PredictionResponse)
def predict_syndrome(payload: SymptomPayload):
    scored = calculate_disease_scores(payload)
    top = scored[0]
    profile = top["profile"]

    differentials = []
    for item in scored[:3]:
        differentials.append(DifferentialDiagnosis(
            disease_name=item["disease"],
            probability=item["prob"],
            severity=item["profile"]["severity"],
            urgency_level="HIGH" if item["profile"]["severity"] in ["CRITICAL", "ZOONOTIC"] else "MEDIUM",
            recommended_quarantine_days=item["profile"]["quarantine_days"],
            containment_protocol=item["profile"]["protocol"]
        ))

    contributions = [
        {"symptom": s, "importance": round(1.0 / (idx + 1), 2)}
        for idx, s in enumerate(top["matched"])
    ]

    return PredictionResponse(
        top_prediction=top["disease"],
        confidence_score=top["prob"],
        severity=profile["severity"],
        zoonotic_risk=profile["zoonotic"],
        quarantine_recommended=profile["quarantine_days"] > 0,
        top_3_differentials=differentials,
        contributing_features=contributions,
        emergency_action_summary=profile["protocol"]
    )

@app.post("/detect-clusters", response_model=ClusterResponse)
def detect_clusters(req: ClusterRequest):
    pts = req.coordinates
    n = len(pts)
    if n < req.min_samples:
        return ClusterResponse(active_clusters_detected=0, clusters=[], outlier_points_count=n)

    # Simplified Density Clustering over coordinates
    visited = [False] * n
    clusters = []
    outliers = 0

    for i in range(n):
        if visited[i]:
            continue
        visited[i] = True

        # Find neighbors within eps_km
        neighbors = [i]
        for j in range(n):
            if i != j:
                dist = haversine_km(pts[i].latitude, pts[i].longitude, pts[j].latitude, pts[j].longitude)
                if dist <= req.eps_km:
                    neighbors.append(j)

        if len(neighbors) >= req.min_samples:
            # Form cluster
            cluster_lats = [pts[k].latitude for k in neighbors]
            cluster_lons = [pts[k].longitude for k in neighbors]
            cluster_reports = [pts[k].report_id for k in neighbors]
            total_affected = sum(pts[k].weight or 1 for k in neighbors)

            center_lat = float(np.mean(cluster_lats))
            center_lon = float(np.mean(cluster_lons))
            max_r = max(haversine_km(center_lat, center_lon, pts[k].latitude, pts[k].longitude) for k in neighbors)

            clusters.append(ClusterCentroid(
                cluster_id=f"cluster_{len(clusters)+1}",
                center_lat=round(center_lat, 6),
                center_lon=round(center_lon, 6),
                radius_km=round(max_r, 2),
                point_count=len(neighbors),
                total_animals_affected=total_affected,
                report_ids=cluster_reports
            ))
            for k in neighbors:
                visited[k] = True
        else:
            outliers += 1

    return ClusterResponse(
        active_clusters_detected=len(clusters),
        clusters=clusters,
        outlier_points_count=outliers
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
