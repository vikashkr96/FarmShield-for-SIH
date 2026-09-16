import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { inMemoryReports } from '../services/surveillanceService';
import { getLiveWeatherRisk } from '../services/weatherService';
import { db } from '../services/dbService';

const router = Router();

export interface ContainmentZone {
  id: string;
  title: string;
  disease_name: string;
  epicenter_lat: number;
  epicenter_lon: number;
  containment_radius_km: number;
  surveillance_radius_km: number;
  status: 'active' | 'surveillance_only' | 'lifted';
  declared_by?: string;
  declared_at: string;
  movement_restrictions_active: boolean;
  advisory_notes?: string;
}

export const inMemoryContainmentZones: ContainmentZone[] = [
  {
    id: 'zone_pune_01',
    title: 'Wagholi-Haveli FMD Containment Ring',
    disease_name: 'Foot-and-Mouth Disease (FMD)',
    epicenter_lat: 18.5793,
    epicenter_lon: 73.9824,
    containment_radius_km: 5.0,
    surveillance_radius_km: 10.0,
    status: 'active',
    declared_by: 'District Veterinary Officer Pune',
    declared_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    movement_restrictions_active: true,
    advisory_notes: 'All live animal transport and unpasteurized milk movement prohibited within 5km radius.',
  },
];

/**
 * Generate a GeoJSON Polygon circle around lat/lon
 */
function createGeoJSONCircle(centerLat: number, centerLon: number, radiusKm: number, points = 32) {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([centerLon + x, centerLat + y]);
  }

  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

/**
 * GET /api/v1/geo/outbreak-map
 * Returns a complete GeoJSON FeatureCollection with incident points and containment buffers
 */
router.get('/geo/outbreak-map', (_req: Request, res: Response) => {
  const features: any[] = [];

  // 1. Add Incident Points
  inMemoryReports.forEach((report) => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [report.longitude, report.latitude],
      },
      properties: {
        featureType: 'disease_incident',
        id: report.id,
        disease: report.suspected_disease,
        severity: report.triage_severity,
        species: report.species,
        affected_count: report.affected_count,
        mortality_count: report.mortality_count,
        status: report.status,
        date: report.created_at,
        is_cluster: report.is_outbreak_cluster,
      },
    });
  });

  // 2. Add Containment Zone Polygons (5km containment & 10km surveillance)
  inMemoryContainmentZones
    .filter((z) => z.status === 'active')
    .forEach((zone) => {
      // 5 km Strict Containment Core
      features.push({
        type: 'Feature',
        geometry: createGeoJSONCircle(zone.epicenter_lat, zone.epicenter_lon, zone.containment_radius_km),
        properties: {
          featureType: 'containment_zone_core',
          id: `${zone.id}_core`,
          zone_id: zone.id,
          title: zone.title,
          disease: zone.disease_name,
          radius_km: zone.containment_radius_km,
          status: zone.status,
          restrictions_active: zone.movement_restrictions_active,
          fillColor: '#ef4444', // Red
          fillOpacity: 0.25,
        },
      });

      // 10 km Surveillance Buffer
      features.push({
        type: 'Feature',
        geometry: createGeoJSONCircle(zone.epicenter_lat, zone.epicenter_lon, zone.surveillance_radius_km),
        properties: {
          featureType: 'surveillance_buffer',
          id: `${zone.id}_buffer`,
          zone_id: zone.id,
          title: `${zone.title} (Surveillance Buffer)`,
          disease: zone.disease_name,
          radius_km: zone.surveillance_radius_km,
          status: zone.status,
          fillColor: '#f59e0b', // Amber
          fillOpacity: 0.12,
        },
      });
    });

  return res.json({
    type: 'FeatureCollection',
    features,
  });
});

/**
 * GET /api/v1/geo/weather-risk
 * Returns climate parameters and calculated vector-borne disease risk multiplier
 */
router.get('/geo/weather-risk', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 18.5793;
  const lon = parseFloat(req.query.lon as string) || 73.9824;

  const assessment = await getLiveWeatherRisk(lat, lon);

  return res.json({
    status: 'success',
    data: assessment,
  });
});

const ContainmentZoneSchema = z.object({
  title: z.string().min(3),
  disease_name: z.string().min(2),
  epicenter_lat: z.number().min(-90).max(90),
  epicenter_lon: z.number().min(-180).max(180),
  containment_radius_km: z.number().positive().default(5.0),
  surveillance_radius_km: z.number().positive().default(10.0),
  declared_by: z.string().optional().default('Veterinary Officer'),
  advisory_notes: z.string().optional(),
});

/**
 * POST /api/v1/geo/containment-zones
 * Declare an official containment zone and broadcast emergency alerts
 */
router.post('/geo/containment-zones', (req: Request, res: Response) => {
  try {
    const validated = ContainmentZoneSchema.parse(req.body);

    const newZone: ContainmentZone = {
      id: `zone_${Date.now()}`,
      title: validated.title,
      disease_name: validated.disease_name,
      epicenter_lat: validated.epicenter_lat,
      epicenter_lon: validated.epicenter_lon,
      containment_radius_km: validated.containment_radius_km,
      surveillance_radius_km: validated.surveillance_radius_km,
      status: 'active',
      declared_by: validated.declared_by,
      declared_at: new Date().toISOString(),
      movement_restrictions_active: true,
      advisory_notes: validated.advisory_notes,
    };

    inMemoryContainmentZones.unshift(newZone);

    // Register system alert
    db.alerts.unshift({
      id: `alert_zone_${Date.now()}`,
      farm_id: 'district_wide',
      type: 'critical',
      severity: 'high',
      message: `[OFFICIAL CONTAINMENT ZONE DECLARED] ${newZone.title} (${newZone.disease_name}). Animal movement restricted within ${newZone.containment_radius_km}km.`,
      message_hi: `[आधिकारिक नियंत्रण क्षेत्र घोषित] ${newZone.title}। ${newZone.containment_radius_km} किमी के भीतर पशु परिवहन प्रतिबंधित।`,
      status: 'active',
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Containment zone declared and broadcast registered',
      data: newZone,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
