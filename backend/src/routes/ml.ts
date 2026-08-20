import { Router, Request, Response } from 'express';
import { predictOveruseRisk, predictComplianceRisk, getModelsMetadata } from '../services/mlService';

const router = Router();

// GET /api/ml/models-info - Returns trained model metadata, algorithms, F1 scores & ROC-AUC
router.get('/ml/models-info', (_req: Request, res: Response) => {
  const metadata = getModelsMetadata();
  res.json({
    status: 'success',
    data: metadata,
  });
});

// POST /api/ml/overuse-risk - Predict Antimicrobial Overuse Risk (Model A)
router.post('/ml/overuse-risk', async (req: Request, res: Response) => {
  try {
    const { species, weight_kg, treatments_last_30d, primary_antimicrobial_class } = req.body;

    if (!species || weight_kg === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: species and weight_kg are required.',
      });
    }

    const result = await predictOveruseRisk(req.body);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message || 'Failed to evaluate overuse risk.' });
  }
});

// POST /api/ml/compliance-risk - Predict MRL / Withdrawal Compliance Risk (Model B)
router.post('/ml/compliance-risk', async (req: Request, res: Response) => {
  try {
    const { species, weight_kg, drug_name, official_withdrawal_period_days, days_elapsed_since_treatment } = req.body;

    if (!species || !drug_name || official_withdrawal_period_days === undefined || days_elapsed_since_treatment === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required compliance fields: species, drug_name, official_withdrawal_period_days, and days_elapsed_since_treatment are required.',
      });
    }

    const result = await predictComplianceRisk(req.body);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message || 'Failed to evaluate compliance risk.' });
  }
});

export default router;
