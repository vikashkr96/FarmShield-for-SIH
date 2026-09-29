import { createClient } from '../supabase/client';
import { SyndromicReport, DiseaseAlert, Species } from '../../types/database';
import { TriageService, TriageResult } from '../services/triage.service';

const SEED_REPORTS: SyndromicReport[] = [
  {
    id: 'rep-001',
    farm_id: 'farm-pb-01',
    reporter_id: 'farmer-01',
    species: 'cow',
    number_affected: 4,
    number_dead: 0,
    symptoms: ['high_fever', 'salivation', 'mouth_blisters', 'lameness'],
    triage_level: 'URGENT',
    probable_disease: 'Foot-and-Mouth Disease (FMD)',
    latitude: 30.901,
    longitude: 75.8573,
    status: 'investigating',
    notes: 'Severe vesicular lesions on tongue and interdigital cleft',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rep-002',
    farm_id: 'farm-pb-01',
    reporter_id: 'farmer-01',
    species: 'goat',
    number_affected: 2,
    number_dead: 1,
    symptoms: ['high_fever', 'nasal_discharge', 'diarrhea'],
    triage_level: 'HIGH',
    probable_disease: 'Peste des Petits Ruminants (PPR)',
    latitude: 30.915,
    longitude: 75.842,
    status: 'investigating',
    notes: 'Muco-purulent ocular discharge and erosive stomatitis',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
];

const SEED_ALERTS: DiseaseAlert[] = [
  {
    id: 'alt-001',
    syndromic_report_id: 'rep-001',
    district: 'Ludhiana',
    disease_name: 'Foot-and-Mouth Disease (FMD)',
    severity: 'critical',
    containment_zone_radius_km: 5,
    is_active: true,
    issued_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

export interface CreateSyndromicInput {
  farmId?: string;
  reporterId?: string;
  species: Species;
  numberAffected: number;
  numberDead: number;
  symptoms: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
}

export class SyndromicRepository {
  private static localReports: SyndromicReport[] = [...SEED_REPORTS];
  private static localAlerts: DiseaseAlert[] = [...SEED_ALERTS];

  static async getReports(district?: string): Promise<SyndromicReport[]> {
    const supabase = createClient();
    try {
      let query = supabase
        .from('syndromic_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (district) {
        query = query.eq('district', district);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data as SyndromicReport[];
      }
    } catch {}

    return district
      ? this.localReports.filter((r) => r.district?.toLowerCase() === district.toLowerCase())
      : this.localReports;
  }

  static async getActiveAlerts(): Promise<DiseaseAlert[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('disease_alerts')
        .select('*')
        .eq('is_active', true)
        .order('issued_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DiseaseAlert[];
      }
    } catch {}

    return this.localAlerts.filter((a) => a.is_active);
  }

  static async submitReport(input: CreateSyndromicInput): Promise<{ report: SyndromicReport; triage: TriageResult }> {
    const supabase = createClient();
    const triage = TriageService.computeTriage({
      species: input.species,
      symptoms: input.symptoms,
      affectedCount: input.numberAffected,
      mortalityCount: input.numberDead,
    });

    const reportId = `rep-${Date.now()}`;
    const newReport: SyndromicReport = {
      id: reportId,
      farm_id: input.farmId || 'farm-pb-01',
      reporter_id: input.reporterId || 'user-current',
      species: input.species,
      number_affected: input.numberAffected,
      number_dead: input.numberDead,
      symptoms: input.symptoms,
      triage_level: triage.urgencyLevel,
      probable_disease: triage.possibleConditions[0] || 'Unclassified Syndromic Episode',
      latitude: input.latitude || 30.901,
      longitude: input.longitude || 75.8573,
      status: 'investigating',
      notes: input.notes,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('syndromic_reports').insert(newReport);

      // If URGENT or HIGH, broadcast alert
      if (triage.urgencyLevel === 'URGENT' || triage.urgencyLevel === 'HIGH') {
        const newAlert: DiseaseAlert = {
          id: `alt-${Date.now()}`,
          syndromic_report_id: reportId,
          district: 'Ludhiana',
          disease_name: newReport.probable_disease,
          severity: triage.urgencyLevel === 'URGENT' ? 'critical' : 'warning',
          containment_zone_radius_km: triage.urgencyLevel === 'URGENT' ? 5 : 3,
          is_active: true,
          issued_at: new Date().toISOString(),
        };
        await supabase.from('disease_alerts').insert(newAlert);
        this.localAlerts.unshift(newAlert);
      }
    } catch {}

    this.localReports.unshift(newReport);
    return { report: newReport, triage };
  }
}
