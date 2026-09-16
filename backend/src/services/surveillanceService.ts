import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import { db } from './dbService';

export interface DiseaseReport {
  id: string;
  client_report_id?: string;
  reporter_id?: string;
  reporter_role: 'farmer' | 'paravet' | 'veterinarian' | 'ivr_system';
  reporter_name?: string;
  reporter_phone?: string;
  farm_id?: string;
  village_id?: string;
  latitude: number;
  longitude: number;
  species: string;
  affected_count: number;
  mortality_count: number;
  symptoms: Record<string, boolean>;
  suspected_disease: string;
  triage_severity: 'LOW' | 'MODERATE' | 'CRITICAL' | 'ZOONOTIC';
  confidence_score: number;
  photo_urls?: string[];
  is_outbreak_cluster: boolean;
  cluster_id?: string;
  status: 'reported' | 'investigating' | 'sample_collected' | 'confirmed' | 'contained' | 'false_alarm';
  assigned_officer_id?: string;
  investigation_notes?: string;
  emergency_instructions?: string;
  recommended_sample_type?: string;
  created_at: string;
  updated_at: string;
}

// In-Memory fallback store
export const inMemoryReports: DiseaseReport[] = [
  {
    id: 'rep_demo_01',
    client_report_id: 'client_rep_01',
    reporter_role: 'paravet',
    reporter_name: 'Dr. Ramesh Patil',
    reporter_phone: '+919876543210',
    latitude: 18.5793,
    longitude: 73.9824,
    species: 'cow',
    affected_count: 4,
    mortality_count: 0,
    symptoms: { high_fever: true, salivation: true, mouth_blisters: true, hoof_lesions: true },
    suspected_disease: 'Foot-and-Mouth Disease (FMD)',
    triage_severity: 'CRITICAL',
    confidence_score: 0.88,
    is_outbreak_cluster: true,
    status: 'investigating',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep_demo_02',
    client_report_id: 'client_rep_02',
    reporter_role: 'farmer',
    reporter_name: 'Sukhwinder Singh',
    reporter_phone: '+919812345678',
    latitude: 18.5810,
    longitude: 73.9850,
    species: 'buffalo',
    affected_count: 2,
    mortality_count: 0,
    symptoms: { salivation: true, mouth_blisters: true },
    suspected_disease: 'Foot-and-Mouth Disease (FMD)',
    triage_severity: 'CRITICAL',
    confidence_score: 0.88,
    is_outbreak_cluster: true,
    status: 'reported',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep_demo_03',
    client_report_id: 'client_rep_03',
    reporter_role: 'farmer',
    reporter_name: 'Kisan Baburao',
    reporter_phone: '+919899988877',
    latitude: 18.5750,
    longitude: 73.9800,
    species: 'cow',
    affected_count: 3,
    mortality_count: 0,
    symptoms: { hoof_lesions: true, salivation: true },
    suspected_disease: 'Foot-and-Mouth Disease (FMD)',
    triage_severity: 'CRITICAL',
    confidence_score: 0.88,
    is_outbreak_cluster: true,
    status: 'reported',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Haversine formula to compute distance in km
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if the given location falls into an active cluster within radiusKm in the last hoursWindow
 */
export async function checkSpatioTemporalCluster(
  latitude: number,
  longitude: number,
  radiusKm = 5.0,
  hoursWindow = 72
): Promise<{ isCluster: boolean; nearbyReportsCount: number; clusterReports: DiseaseReport[] }> {
  const cutoffTime = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      // Use PostGIS ST_DWithin query via RPC or direct query
      try {
        const { data, error } = await client
          .from('disease_reports')
          .select('*')
          .gte('created_at', cutoffTime.toISOString());

        if (!error && data) {
          const matched = (data as DiseaseReport[]).filter((r) => {
            const dist = calculateHaversineKm(latitude, longitude, r.latitude, r.longitude);
            return dist <= radiusKm;
          });
          return {
            isCluster: matched.length >= 2, // With the new one, total will be >= 3
            nearbyReportsCount: matched.length,
            clusterReports: matched,
          };
        }
      } catch (e) {
        console.warn('Supabase spatial cluster query fallback to memory:', e);
      }
    }
  }

  // Memory fallback
  const matched = inMemoryReports.filter((r) => {
    const reportTime = new Date(r.created_at);
    if (reportTime < cutoffTime) return false;
    const dist = calculateHaversineKm(latitude, longitude, r.latitude, r.longitude);
    return dist <= radiusKm;
  });

  return {
    isCluster: matched.length >= 2,
    nearbyReportsCount: matched.length,
    clusterReports: matched,
  };
}

/**
 * Save new report with idempotency check
 */
export async function saveDiseaseReport(report: DiseaseReport): Promise<DiseaseReport> {
  // Check client_report_id for offline sync idempotency
  if (report.client_report_id) {
    const existing = inMemoryReports.find((r) => r.client_report_id === report.client_report_id);
    if (existing) {
      return existing;
    }
  }

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('disease_reports')
          .insert([report])
          .select()
          .single();
        if (!error && data) {
          inMemoryReports.unshift(data as DiseaseReport);
          return data as DiseaseReport;
        }
      } catch (e) {
        console.warn('Supabase insert failed, fallback to memory:', e);
      }
    }
  }

  inMemoryReports.unshift(report);

  // If critical cluster, trigger an alert into the system
  if (report.is_outbreak_cluster || report.triage_severity === 'CRITICAL' || report.triage_severity === 'ZOONOTIC') {
    db.alerts.unshift({
      id: `alert_surv_${Date.now()}`,
      farm_id: report.farm_id || 'system_wide',
      type: 'critical',
      severity: 'high',
      message: `[OUTBREAK ALERT] ${report.suspected_disease} flagged near (${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}). ${report.affected_count} animals affected.`,
      message_hi: `[महामारी चेतावनी] (${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}) के पास ${report.suspected_disease} की सूचना मिली है।`,
      status: 'active',
      created_at: new Date().toISOString(),
    });
  }

  return report;
}
