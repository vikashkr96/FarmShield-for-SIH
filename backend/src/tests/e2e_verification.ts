import app from '../server';
import http from 'http';

process.env.NODE_ENV = 'test';
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

  // 3. Surveillance Report: Anthrax Zoonotic Triage
  await test('3. POST /v1/surveillance/report - Anthrax Zoonotic Triage Detection', async () => {
    const res = await fetch(`${baseUrl}/v1/surveillance/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_report_id: `test_anthrax_${Date.now()}`,
        reporter_role: 'farmer',
        species: 'cow',
        affected_count: 1,
        mortality_count: 1,
        latitude: 27.5258,
        longitude: 77.4984,
        symptoms: { sudden_death: true, unclotted_blood: true }
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 201 || json.data.triage_severity !== 'ZOONOTIC' || json.data.suspected_disease !== 'Suspected Anthrax') {
      throw new Error(`Anthrax triage failed: ${JSON.stringify(json)}`);
    }
  });

  // 4. Lab Referral Chain of Custody
  let sampleId = '';
  await test('4. POST /v1/lab-referrals - Register Diagnostic Sample', async () => {
    const res = await fetch(`${baseUrl}/v1/lab-referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: 'rep_demo_01',
        sample_type: 'Vesicular Fluid',
        cold_chain_maintained: true,
        collected_by: 'Dr. Ramesh Patil',
        referral_lab_name: 'Western Regional Disease Diagnostic Lab'
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 201 || !json.data.sample_code.startsWith('SMP-')) {
      throw new Error(`Sample creation failed: ${JSON.stringify(json)}`);
    }
    sampleId = json.data.id;
  });

  // 5. Update Lab Result to Confirmed Positive
  await test('5. PATCH /v1/lab-referrals/:id/result - RT-PCR Positive Confirmation', async () => {
    const res = await fetch(`${baseUrl}/v1/lab-referrals/${sampleId}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_method: 'RT-PCR',
        result_status: 'confirmed_positive',
        pathogen_identified: 'Foot-and-Mouth Disease Virus (Type O)',
        verified_by_pathologist: 'Dr. Ananya Sen (Lead Virologist)'
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 200 || json.data.result_status !== 'confirmed_positive') {
      throw new Error(`Lab confirmation update failed: ${JSON.stringify(json)}`);
    }
  });

  // 6. Escalation SLA Engine
  await test('6. GET /v1/escalations/pending - SLA Breach Countdown & Urgency Score', async () => {
    const res = await fetch(`${baseUrl}/v1/escalations/pending`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || typeof json.total_pending !== 'number' || !Array.isArray(json.data)) {
      throw new Error('Escalation pending query failed');
    }
  });

  // 7. GeoJSON Outbreak Map Layer
  await test('7. GET /v1/geo/outbreak-map - GeoJSON FeatureCollection', async () => {
    const res = await fetch(`${baseUrl}/v1/geo/outbreak-map`);
    const json = (await res.json()) as any;
    if (res.status !== 200 || json.type !== 'FeatureCollection') {
      throw new Error('GeoJSON outbreak map generation failed');
    }
  });

  // 8. IVR Toll-Free Voice Tree Ingestion (XML TwiML)
  await test('8. POST /v1/ivr/voice - IVR Voice XML Greeting', async () => {
    const res = await fetch(`${baseUrl}/v1/ivr/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ From: '+919876543210', CallSid: 'call_test_101' })
    });
    const xml = await res.text();
    if (res.status !== 200 || !xml.includes('<Gather') || !xml.includes('पशु स्वास्थ्य')) {
      throw new Error('IVR Voice TwiML generation failed');
    }
  });

  // 9. SMS Feature-Phone Ingestion Webhook
  await test('9. POST /v1/ivr/sms-webhook - Incoming Feature Phone SMS Report', async () => {
    const res = await fetch(`${baseUrl}/v1/ivr/sms-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: '+919988776655',
        Body: 'REPORT 412207 COW SORES AND BLISTERS'
      })
    });
    const json = (await res.json()) as any;
    if (res.status !== 200 || !json.reply_sms.includes('Foot-and-Mouth Disease')) {
      throw new Error(`SMS ingestion failed: ${JSON.stringify(json)}`);
    }
  });

  console.log('\n------------------------------------------------------');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('------------------------------------------------------\n');

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
};

runTests();
