import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { evaluateSyndromicTriage } from '../services/triageEngine';
import {
  saveDiseaseReport,
  checkSpatioTemporalCluster,
  inMemoryReports,
  DiseaseReport,
} from '../services/surveillanceService';

const router = Router();

// Zod Input Validation Schema
const DiseaseReportSchema = z.object({
  client_report_id: z.string().optional(),
  reporter_role: z.enum(['farmer', 'paravet', 'veterinarian', 'ivr_system']).default('farmer'),
  reporter_name: z.string().optional(),
  reporter_phone: z.string().optional(),
  farm_id: z.string().optional(),
  village_id: z.string().optional(),
  species: z.enum(['cow', 'buffalo', 'goat', 'sheep', 'poultry', 'pig', 'other']),
  affected_count: z.number().int().nonnegative().default(1),
  mortality_count: z.number().int().nonnegative().default(0),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  symptoms: z.record(z.boolean()),
  photo_urls: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/v1/surveillance/report
 * Main ingestion endpoint for field syndromic reporting with triage & cluster detection
 */
router.post('/surveillance/report', async (req: Request, res: Response) => {
  try {
    const validated = DiseaseReportSchema.parse(req.body);

    // 1. Run deterministic clinical triage rules
    const triage = await evaluateSyndromicTriage({
      species: validated.species,
      affected_count: validated.affected_count,
      mortality_count: validated.mortality_count,
      symptoms: validated.symptoms,
    });

    // 2. Check 5 km radius spatial cluster in past 72 hours
    const clusterCheck = await checkSpatioTemporalCluster(validated.latitude, validated.longitude, 5.0, 72);

    const isCluster = clusterCheck.isCluster;
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newReport: DiseaseReport = {
      id: reportId,
      client_report_id: validated.client_report_id,
      reporter_role: validated.reporter_role,
      reporter_name: validated.reporter_name,
      reporter_phone: validated.reporter_phone,
      farm_id: validated.farm_id,
      village_id: validated.village_id,
      latitude: validated.latitude,
      longitude: validated.longitude,
      species: validated.species,
      affected_count: validated.affected_count,
      mortality_count: validated.mortality_count,
      symptoms: validated.symptoms,
      suspected_disease: triage.suspected_disease,
      triage_severity: triage.triage_severity,
      confidence_score: triage.confidence_score,
      photo_urls: validated.photo_urls,
      is_outbreak_cluster: isCluster,
      cluster_id: isCluster ? (clusterCheck.clusterReports[0]?.cluster_id || `clust_${Date.now()}`) : undefined,
      status: 'reported',
      emergency_instructions: triage.emergency_instructions,
      recommended_sample_type: triage.recommended_sample_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveDiseaseReport(newReport);

    return res.status(201).json({
      status: 'success',
      message: 'Disease report registered and triaged successfully',
      data: {
        report_id: saved.id,
        suspected_disease: triage.suspected_disease,
        triage_severity: triage.triage_severity,
        confidence_score: triage.confidence_score,
        emergency_instructions: triage.emergency_instructions,
        recommended_sample_type: triage.recommended_sample_type,
        quarantine_recommended: triage.quarantine_recommended,
        zoonotic_warning: triage.zoonotic_warning,
        cluster_warning: isCluster,
        cluster_info: isCluster
          ? {
              nearby_cases_in_5km: clusterCheck.nearbyReportsCount + 1,
              time_window: '72 hours',
              containment_action: 'Recommend 5km radius movement restriction advisory',
            }
          : null,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed on disease report',
        errors: err.errors,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error while processing disease report',
    });
  }
});

/**
 * GET /api/v1/surveillance/reports
 * Query reports with filters (district, species, severity, status)
 */
router.get('/surveillance/reports', (req: Request, res: Response) => {
  const { species, severity, status, limit = '50', page = '1' } = req.query;

  let results = [...inMemoryReports];

  if (species && typeof species === 'string') {
    results = results.filter((r) => r.species.toLowerCase() === species.toLowerCase());
  }
  if (severity && typeof severity === 'string') {
    results = results.filter((r) => r.triage_severity.toUpperCase() === severity.toUpperCase());
  }
  if (status && typeof status === 'string') {
    results = results.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = results.slice(startIndex, startIndex + limitNum);

  return res.json({
    status: 'success',
    total_records: results.length,
    page: pageNum,
    limit: limitNum,
    data: paginated,
  });
});

/**
 * GET /api/v1/surveillance/clusters
 * Returns grouped clusters of high-severity or recurring disease activity
 */
router.get('/surveillance/clusters', (_req: Request, res: Response) => {
  const clusterReports = inMemoryReports.filter((r) => r.is_outbreak_cluster || r.triage_severity === 'CRITICAL');

  // Simple centroid calculation
  let totalLat = 0;
  let totalLon = 0;
  let totalAffected = 0;

  clusterReports.forEach((r) => {
    totalLat += r.latitude;
    totalLon += r.longitude;
    totalAffected += r.affected_count;
  });

  const count = clusterReports.length || 1;
  const centroid = {
    latitude: count > 0 ? totalLat / count : 18.5793,
    longitude: count > 0 ? totalLon / count : 73.9824,
  };

  return res.json({
    status: 'success',
    data: {
      active_cluster_count: clusterReports.length > 0 ? 1 : 0,
      estimated_epicenter: centroid,
      total_animals_at_risk: totalAffected,
      recommended_buffer_radius_km: 5.0,
      reports: clusterReports,
    },
  });
});

export default router;
