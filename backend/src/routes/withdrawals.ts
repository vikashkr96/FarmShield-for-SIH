import { Router, Request, Response } from 'express';
import { db } from '../services/dbService';

const router = Router();

// GET /api/withdrawals - Get all withdrawal records and milk safety status
router.get('/withdrawals', (_req: Request, res: Response) => {
  const now = new Date();

  const activeWithdrawals = db.withdrawals.map((w) => {
    const animal = db.animals.find((a) => a.id === w.animal_id);
    const treatment = db.treatments.find((t) => t.id === w.treatment_id);
    const medicine = db.medicines.find((m) => m.id === treatment?.medicine_id);

    const endDate = new Date(w.end_date);
    const isStillActive = endDate > now;
    const diffTime = endDate.getTime() - now.getTime();
    const remainingDays = isStillActive ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

    return {
      id: w.id,
      animalId: w.animal_id,
      animalCode: animal?.animal_code || 'Unknown Tag',
      species: animal?.species || 'cow',
      product: w.product,
      startDate: w.start_date,
      endDate: w.end_date,
      withdrawalDays: w.withdrawal_days,
      remainingDays,
      status: isStillActive ? 'active' : 'completed',
      medicineName: medicine?.name || 'Antimicrobial',
    };
  });

  const totalUnsafeMilk = activeWithdrawals.filter((w) => w.status === 'active' && w.product === 'milk').length;

  res.json({
    status: 'success',
    summary: {
      totalUnderWithdrawal: activeWithdrawals.filter((w) => w.status === 'active').length,
      unsafeMilkCount: totalUnsafeMilk,
      allProductsSafe: totalUnsafeMilk === 0,
    },
    data: activeWithdrawals,
  });
});

export default router;
