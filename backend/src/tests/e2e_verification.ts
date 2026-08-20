import app from '../server';
import http from 'http';

const PORT = 5099;
const server = http.createServer(app);

const runTests = async () => {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`[TEST SERVER] Running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api`;
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  };

  console.log('\n======================================================');
  console.log(' RUNNING COMPREHENSIVE END-TO-END INTEGRATION TESTS ');
  console.log('======================================================\n');

  // 1. Health Check
  await test('1. GET /health - Server Health Check', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || json.status !== 'online') throw new Error('Health check failed');
  });

  // 2. ML Models Info
  await test('2. GET /ml/models-info - Model A & B Metrics', async () => {
    const res = await fetch(`${baseUrl}/ml/models-info`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || !json.data.model_a || !json.data.model_b) throw new Error('Models metadata missing');
  });

  // 3. ML Overuse Risk
  await test('3. POST /ml/overuse-risk - Model A Overuse Prediction', async () => {
    const res = await fetch(`${baseUrl}/ml/overuse-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        species: 'cow',
        weight_kg: 420,
        treatments_last_30d: 4,
        primary_antimicrobial_class: 'Fluoroquinolones',
        treatment_duration_days: 8,
        farm_level_amu_trend: 'Increasing'
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 200 || json.data.risk_level !== 'HIGH' || json.data.reason_codes.length === 0) {
      throw new Error('Overuse risk prediction mismatch');
    }
  });

  // 4. ML Compliance Risk
  await test('4. POST /ml/compliance-risk - Model B Compliance Risk', async () => {
    const res = await fetch(`${baseUrl}/ml/compliance-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        species: 'cow',
        weight_kg: 420,
        drug_name: 'Oxytetracycline',
        product_type: 'milk',
        official_withdrawal_period_days: 7,
        days_elapsed_since_treatment: 2,
        prescribed_dose_mg_per_kg: 10,
        actual_dose_mg_per_kg: 13
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 200 || json.data.risk_level !== 'HIGH' || !json.data.clearance_badge.includes('WITHDRAWAL')) {
      throw new Error('Compliance risk prediction mismatch');
    }
  });

  // 5. Animals List
  await test('5. GET /animals - List Registered Animals', async () => {
    const res = await fetch(`${baseUrl}/animals`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || !Array.isArray(json.data) || json.data.length === 0) throw new Error('Animals list empty');
  });

  // 6. Animal QR Code Generation
  await test('6. GET /animals/:id/qr-code - Dynamic QR Code Data URL', async () => {
    const res = await fetch(`${baseUrl}/animals/a101/qr-code`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || !json.data.qr_data_url.startsWith('data:image/png;base64,')) {
      throw new Error('QR data URL invalid');
    }
  });

  // 7. Public QR Token Verification Lookup
  await test('7. GET /animals/qr/:qrToken - Public Passport Verification', async () => {
    const res = await fetch(`${baseUrl}/animals/qr/QR-COW-101`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || json.data.animalCode !== 'COW-101' || !json.data.withdrawalStatus) {
      throw new Error('Public QR lookup failed');
    }
  });

  // 8. Record Treatment & Auto-Withdrawal + ML Scoring
  await test('8. POST /treatments - Record Treatment & Auto Calculate Withdrawal', async () => {
    const res = await fetch(`${baseUrl}/treatments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animal_id: 'a101',
        medicine_id: 'm1',
        dose: 10,
        duration: 4,
        start_date: new Date().toISOString(),
        product_affected: 'milk',
        indication: 'Bovine Respiratory Disease',
        frequency: 'Once Daily',
        route: 'Intramuscular'
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 201 || !json.data.withdrawal || !json.data.safeDateISO) {
      throw new Error('Treatment recording failed');
    }
  });

  // 9. AMU Summary Analytics
  await test('9. GET /amu/summary - AMU Analytics & Trends', async () => {
    const res = await fetch(`${baseUrl}/amu/summary`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || !json.data.metrics || !json.data.monthlyTrend) {
      throw new Error('AMU summary failed');
    }
  });

  // 10. Alerts
  await test('10. GET /alerts - Active Alerts List', async () => {
    const res = await fetch(`${baseUrl}/alerts`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || !Array.isArray(json.data)) throw new Error('Alerts query failed');
  });

  console.log('\n------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('------------------------------------------------------\n');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
