import { Router } from 'express';
import healthRouter from './health';
import animalsRouter from './animals';
import treatmentsRouter from './treatments';
import withdrawalsRouter from './withdrawals';
import alertsRouter from './alerts';
import amuRouter from './amu';
import medicinesRouter from './medicines';
import mlRouter from './ml';

const router = Router();

// Health Check
router.use('/', healthRouter);

// REST API Modular Mounts
router.use('/', animalsRouter);
router.use('/', treatmentsRouter);
router.use('/', withdrawalsRouter);
router.use('/', alertsRouter);
router.use('/', amuRouter);
router.use('/', medicinesRouter);
router.use('/', mlRouter);

export default router;
