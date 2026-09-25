import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import animalsRouter from './animals';
import treatmentsRouter from './treatments';
import withdrawalsRouter from './withdrawals';
import alertsRouter from './alerts';
import amuRouter from './amu';
import medicinesRouter from './medicines';
import mlRouter from './ml';
import surveillanceRouter from './surveillance';
import geoRouter from './geo';
import labReferralRouter from './labReferral';
import ivrRouter from './ivr';

const router = Router();

// Health Check
router.use('/', healthRouter);

// REST API Modular Mounts
router.use('/', authRouter);
router.use('/', animalsRouter);
router.use('/', treatmentsRouter);
router.use('/', withdrawalsRouter);
router.use('/', alertsRouter);
router.use('/', amuRouter);
router.use('/', medicinesRouter);
router.use('/', mlRouter);

// Surveillance & Outbreak Triage Engine (SIH)
router.use('/v1', surveillanceRouter);
router.use('/v1', geoRouter);
router.use('/v1', labReferralRouter);
router.use('/v1', ivrRouter);

export default router;
