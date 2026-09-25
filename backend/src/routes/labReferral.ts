import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { inMemoryReports, DiseaseReport } from '../services/surveillanceService';
import { db } from '../services/dbService';

const router = Router();

export interface SampleReferral {
  id: string;
  report_id: string;
  sample_code: string;
  sample_type: 'Blood' | 'Serum' | 'Nasal Swab' | 'Vesicular Fluid' | 'Tissue' | 'Milk' | 'Fecal' | 'Scab';
  cold_chain_maintained: boolean;
  collected_by?: string;
  referral_lab_name: string;
  dispatch_date: string;
  received_date?: string;
  test_method?: string;
  result_status: 'pending' | 'processing' | 'confirmed_positive' | 'confirmed_negative' | 'inconclusive';
  pathogen_identified?: string;
  lab_report_pdf_url?: string;
  verified_by_pathologist?: string;
  created_at: string;
  updated_at: string;
}

export const inMemorySampleReferrals: SampleReferral[] = [
  {
    id: 'smp_ref_01',
    report_id: 'rep_demo_01',
    sample_code: 'SMP-20260910-A109',
    sample_type: 'Vesicular Fluid',
    cold_chain_maintained: true,
    collected_by: 'Dr. Ramesh Patil (Paravet)',
    referral_lab_name: 'Western Regional Disease Diagnostic Laboratory (WRDDL), Pune',
    dispatch_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    result_status: 'processing',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function generateSampleCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SMP-${dateStr}-${rand}`;
}

const CreateSampleSchema = z.object({
  report_id: z.string().min(1),
  sample_type: z.enum(['Blood', 'Serum', 'Nasal Swab', 'Vesicular Fluid', 'Tissue', 'Milk', 'Fecal', 'Scab']),
  cold_chain_maintained: z.boolean().default(true),
  collected_by: z.string().optional().default('Field Veterinary Officer'),
  referral_lab_name: z.string().min(3),
  dispatch_date: z.string().optional(),
});

/**
 * POST /api/v1/lab-referrals
 * Register sample collection and initiate diagnostic laboratory custody
 */
router.post('/lab-referrals', (req: Request, res: Response) => {
  try {
    const validated = CreateSampleSchema.parse(req.body);

    const report = inMemoryReports.find((r) => r.id === validated.report_id);
    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: `Disease report with ID ${validated.report_id} not found`,
      });
    }

    const sampleCode = generateSampleCode();
    const newSample: SampleReferral = {
      id: `smp_${Date.now()}`,
      report_id: validated.report_id,
      sample_code: sampleCode,
      sample_type: validated.sample_type,
      cold_chain_maintained: validated.cold_chain_maintained,
      collected_by: validated.collected_by,
      referral_lab_name: validated.referral_lab_name,
      dispatch_date: validated.dispatch_date || new Date().toISOString(),
      result_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemorySampleReferrals.unshift(newSample);

    // Update parent disease report status
    report.status = 'sample_collected';
    report.updated_at = new Date().toISOString();

    return res.status(201).json({
      status: 'success',
      message: 'Sample collection logged and chain-of-custody established',
      data: newSample,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

const UpdateResultSchema = z.object({
  test_method: z.string().min(2),
  result_status: z.enum(['confirmed_positive', 'confirmed_negative', 'inconclusive']),
  pathogen_identified: z.string().optional(),
  lab_report_pdf_url: z.string().optional(),
  verified_by_pathologist: z.string().optional().default('Chief Pathologist'),
});

/**
 * PATCH /api/v1/lab-referrals/:id/result
 * Log definitive diagnostic lab results and trigger confirmation alert
 */
router.patch('/lab-referrals/:id/result', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sample = inMemorySampleReferrals.find((s) => s.id === id || s.sample_code === id);

    if (!sample) {
      return res.status(404).json({ status: 'error', message: 'Sample referral record not found' });
    }

    const validated = UpdateResultSchema.parse(req.body);

    sample.test_method = validated.test_method;
    sample.result_status = validated.result_status;
    sample.pathogen_identified = validated.pathogen_identified;
    sample.lab_report_pdf_url = validated.lab_report_pdf_url;
    sample.verified_by_pathologist = validated.verified_by_pathologist;
    sample.received_date = sample.received_date || new Date().toISOString();
    sample.updated_at = new Date().toISOString();

    // Update corresponding report status
    const report = inMemoryReports.find((r) => r.id === sample.report_id);
    if (report) {
      if (validated.result_status === 'confirmed_positive') {
        report.status = 'confirmed';
        if (validated.pathogen_identified) {
          report.suspected_disease = validated.pathogen_identified;
        }

        // District emergency notification
        db.alerts.unshift({
          id: `alert_lab_conf_${Date.now()}`,
          farm_id: report.farm_id || 'district_wide',
          type: 'critical',
          severity: 'high',
          message: `[LAB CONFIRMED POSITIVE] ${sample.pathogen_identified || report.suspected_disease} confirmed via ${validated.test_method} (${sample.sample_code}). Initiate ring vaccination.`,
          message_hi: `[प्रयोगशाला पुष्टि] ${sample.sample_code} की जांच में ${sample.pathogen_identified || report.suspected_disease} की पुष्टि हुई है।`,
          status: 'active',
          created_at: new Date().toISOString(),
        });
      } else if (validated.result_status === 'confirmed_negative') {
        report.status = 'false_alarm';
      }
      report.updated_at = new Date().toISOString();
    }

    return res.json({
      status: 'success',
      message: 'Diagnostic test result recorded',
      data: sample,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/v1/lab-referrals
 * List all active diagnostic sample referral cases
 */
router.get('/lab-referrals', (_req: Request, res: Response) => {
  return res.json({
    status: 'success',
    total: inMemorySampleReferrals.length,
    data: inMemorySampleReferrals,
  });
});

/**
 * GET /api/v1/escalations/pending
 * Retrieve CRITICAL or ZOONOTIC cases exceeding SLA (> 4 hours without assigned officer)
 */
router.get('/escalations/pending', (_req: Request, res: Response) => {
  const SLA_HOURS = 4;
  const now = Date.now();

  const pendingEscalations = inMemoryReports
    .filter((r) => {
      const isCritical = r.triage_severity === 'CRITICAL' || r.triage_severity === 'ZOONOTIC';
      const isUnassigned = !r.assigned_officer_id;
      const isPendingStatus = r.status === 'reported';
      return isCritical && isUnassigned && isPendingStatus;
    })
    .map((r) => {
      const reportTime = new Date(r.created_at).getTime();
      const ageHours = (now - reportTime) / (1000 * 60 * 60);
      const isBreached = ageHours >= SLA_HOURS;
      const remainingMinutes = Math.max(0, Math.round((SLA_HOURS - ageHours) * 60));

      return {
        report_id: r.id,
        disease: r.suspected_disease,
        severity: r.triage_severity,
        species: r.species,
        affected_count: r.affected_count,
        mortality_count: r.mortality_count,
        reported_at: r.created_at,
        age_hours: parseFloat(ageHours.toFixed(2)),
        sla_limit_hours: SLA_HOURS,
        is_sla_breached: isBreached,
        remaining_sla_minutes: remainingMinutes,
        urgency_score: r.triage_severity === 'ZOONOTIC' ? 100 : isBreached ? 90 : 70,
      };
    })
    .sort((a, b) => b.urgency_score - a.urgency_score);

  return res.json({
    status: 'success',
    total_pending: pendingEscalations.length,
    breached_count: pendingEscalations.filter((p) => p.is_sla_breached).length,
    data: pendingEscalations,
  });
});

const AssignOfficerSchema = z.object({
  officer_id: z.string().min(1),
  officer_name: z.string().min(2),
  role: z.enum(['veterinarian', 'paravet', 'rapid_response_team']).default('veterinarian'),
  instructions: z.string().optional(),
});

/**
 * POST /api/v1/escalations/:reportId/assign
 * Assign report to field veterinarian / emergency response squad
 */
router.post('/escalations/:reportId/assign', (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = inMemoryReports.find((r) => r.id === reportId);

    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Report not found' });
    }

    const validated = AssignOfficerSchema.parse(req.body);

    report.assigned_officer_id = validated.officer_id;
    report.status = 'investigating';
    report.investigation_notes = validated.instructions
      ? `Assigned to ${validated.officer_name} (${validated.role}): ${validated.instructions}`
      : `Assigned to ${validated.officer_name} (${validated.role})`;
    report.updated_at = new Date().toISOString();

    return res.json({
      status: 'success',
      message: `Report assigned to ${validated.officer_name}`,
      data: {
        report_id: report.id,
        status: report.status,
        assigned_officer: validated.officer_name,
        officer_role: validated.role,
        assigned_at: report.updated_at,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
