import { Router, Request, Response } from 'express';
import { db } from '../services/dbService';

const router = Router();

// GET /api/amu/summary - Antimicrobial Usage (AMU) Analytics Summary
router.get('/amu/summary', (_req: Request, res: Response) => {
  const totalTreatments = db.treatments.length;
  const treatedAnimalsCount = new Set(db.treatments.map((t) => t.animal_id)).size;

  // Monthly AMU trend data generator
  const monthlyTrend = [
    { month: 'Mar 2026', treatments: 4, amoxicillin: 200, oxytetracycline: 400 },
    { month: 'Apr 2026', treatments: 6, amoxicillin: 350, oxytetracycline: 600 },
    { month: 'May 2026', treatments: 3, amoxicillin: 150, oxytetracycline: 200 },
    { month: 'Jun 2026', treatments: 8, amoxicillin: 450, oxytetracycline: 800 },
    { month: 'Jul 2026', treatments: 5, amoxicillin: 300, oxytetracycline: 500 },
    { month: 'Aug 2026', treatments: totalTreatments, amoxicillin: 250, oxytetracycline: 400 },
  ];

  // Antimicrobial Usage by Class
  const usageByClass = [
    { name: 'Penicillins (Amoxicillin)', count: 5, percentage: 45 },
    { name: 'Tetracyclines (Oxytetracycline)', count: 4, percentage: 35 },
    { name: 'Macrolides (Tylosin)', count: 2, percentage: 20 },
  ];

  // AMU by Species
  const usageBySpecies = [
    { species: 'Cow (गाय)', treatments: 7 },
    { species: 'Buffalo (भैंस)', treatments: 3 },
    { species: 'Goat (बकरी)', treatments: 1 },
  ];

  res.json({
    status: 'success',
    data: {
      metrics: {
        totalTreatments,
        treatedAnimalsCount,
        repeatedTreatmentsCount: 1,
        complianceRate: '98.5%',
      },
      monthlyTrend,
      usageByClass,
      usageBySpecies,
    },
  });
});

export default router;
