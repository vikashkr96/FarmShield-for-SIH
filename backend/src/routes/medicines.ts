import { Router, Request, Response } from 'express';
import { db, Medicine, RegulatoryRule } from '../services/dbService';

const router = Router();

// GET /api/medicines - Get medicines catalog
router.get('/medicines', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: db.medicines,
  });
});

// POST /api/medicines - Add new medicine to catalog
router.post('/medicines', (req: Request, res: Response) => {
  const { name, active_ingredient, antimicrobial_class, strength } = req.body;
  if (!name || !active_ingredient) {
    return res.status(400).json({ status: 'error', message: 'Name and active_ingredient are required' });
  }

  const newMedicine: Medicine = {
    id: `m_${Date.now()}`,
    name,
    active_ingredient,
    antimicrobial_class: antimicrobial_class || 'General Antimicrobial',
    strength: strength || '100 mg/ml',
    status: 'active',
  };

  db.medicines.push(newMedicine);

  res.status(201).json({ status: 'success', data: newMedicine });
});

// GET /api/regulatory-rules - Get FSSAI regulatory MRL rules
router.get('/regulatory-rules', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: db.rules,
  });
});

// POST /api/regulatory-rules - Add regulatory rule
router.post('/regulatory-rules', (req: Request, res: Response) => {
  const { medicine_id, species, product, mrl, withdrawal_days, jurisdiction } = req.body;
  if (!medicine_id || !species || !withdrawal_days) {
    return res.status(400).json({ status: 'error', message: 'medicine_id, species, and withdrawal_days required' });
  }

  const newRule: RegulatoryRule = {
    id: `r_${Date.now()}`,
    medicine_id,
    species,
    product: product || 'milk',
    mrl: mrl || '50 ug/kg',
    withdrawal_days: Number(withdrawal_days),
    jurisdiction: jurisdiction || 'India (FSSAI)',
    approval_status: 'approved',
  };

  db.rules.push(newRule);

  res.status(201).json({ status: 'success', data: newRule });
});

export default router;
