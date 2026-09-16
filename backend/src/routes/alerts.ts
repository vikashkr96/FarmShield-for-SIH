import { Router, Request, Response } from 'express';
import { db } from '../services/dbService';

const router = Router();

// GET /api/alerts - Get all warnings & alerts
router.get('/alerts', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: db.alerts,
  });
});

// PATCH /api/alerts/:id - Mark an alert as resolved
router.patch('/alerts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = db.alerts.find((a) => a.id === id);

  if (!alert) {
    return res.status(404).json({ status: 'error', message: 'Alert not found' });
  }

  alert.status = 'resolved';

  res.json({
    status: 'success',
    data: alert,
  });
});

export default router;
