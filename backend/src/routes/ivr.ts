import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { evaluateSyndromicTriage } from '../services/triageEngine';
import { saveDiseaseReport, checkSpatioTemporalCluster, DiseaseReport } from '../services/surveillanceService';

const router = Router();

// In-memory call session store for multi-step IVR
interface CallSession {
  callSid: string;
  callerPhone: string;
  species?: 'cow' | 'goat' | 'buffalo' | 'sheep';
  pincode?: string;
  latitude?: number;
  longitude?: number;
}
const activeSessions: Map<string, CallSession> = new Map();

/**
 * POST /api/v1/ivr/voice
 * Initial voice call greeting and species selection (Step 1)
 */
router.post('/ivr/voice', (req: Request, res: Response) => {
  const callerPhone = (req.body.From || req.body.CallFrom || req.body.caller_phone || '+919876543210') as string;
  const callSid = (req.body.CallSid || req.body.call_sid || `call_${Date.now()}`) as string;

  activeSessions.set(callSid, {
    callSid,
    callerPhone,
    latitude: 18.5793, // Default triangulated cell tower or dispensary coords
    longitude: 73.9824,
  });

  // TwiML / Exotel compatible XML response with audio prompts
  const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather action="/api/v1/ivr/symptoms?callSid=${callSid}" numDigits="1" timeout="10" method="POST">
    <Say language="hi-IN" voice="Polly.Aditi">
      पशु स्वास्थ्य आपातकालीन सेवा में आपका स्वागत है। 
      गाय या भैंस के लिए 1 दबाएं। 
      बकरी या भेड़ के लिए 2 दबाएं। 
      पोल्ट्री के लिए 3 दबाएं।
    </Say>
    <Say language="en-IN">
      For cattle or buffalo, press 1. For goat or sheep, press 2. For poultry, press 3.
    </Say>
  </Gather>
  <Say language="hi-IN">हमें कोई इनपुट नहीं मिला। कृपया पुनः प्रयास करें।</Say>
</Response>`;

  res.set('Content-Type', 'text/xml');
  return res.send(responseXml);
});

/**
 * POST /api/v1/ivr/symptoms
 * Keypad response for symptom selection (Step 2) -> creates DiseaseReport
 */
router.post('/ivr/symptoms', async (req: Request, res: Response) => {
  const callSid = (req.query.callSid || req.body.CallSid || req.body.call_sid) as string;
  const digits = (req.body.Digits || req.body.digits || '1') as string;

  const session = activeSessions.get(callSid) || {
    callSid: callSid || `call_${Date.now()}`,
    callerPhone: (req.body.From || '+919876543210') as string,
    latitude: 18.5793,
    longitude: 73.9824,
  };

  // Map digits to species
  const speciesMap: Record<string, string> = {
    '1': 'cow',
    '2': 'goat',
    '3': 'poultry',
  };
  const species = speciesMap[digits] || 'cow';
  session.species = species as any;

  // Next Question TwiML
  const symptomGatherXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather action="/api/v1/ivr/finalize?callSid=${session.callSid}&amp;species=${species}" numDigits="1" timeout="10" method="POST">
    <Say language="hi-IN" voice="Polly.Aditi">
      यदि तेज बुखार और मुंह या खुर में छाले हैं, तो 1 दबाएं। 
      यदि त्वचा पर गांठें हैं, तो 2 दबाएं। 
      यदि अचानक बिना लक्षण मृत्यु हुई है या खून बह रहा है, तो 3 दबाएं।
    </Say>
    <Say language="en-IN">
      Press 1 for fever with mouth or hoof blisters. 
      Press 2 for skin nodules. 
      Press 3 for sudden death with bleeding.
    </Say>
  </Gather>
</Response>`;

  res.set('Content-Type', 'text/xml');
  return res.send(symptomGatherXml);
});

/**
 * POST /api/v1/ivr/finalize
 * Finalize report creation from IVR keypad digits
 */
router.post('/ivr/finalize', async (req: Request, res: Response) => {
  const callSid = (req.query.callSid || req.body.CallSid) as string;
  const species = (req.query.species || 'cow') as string;
  const digits = (req.body.Digits || req.body.digits || '1') as string;

  const session = activeSessions.get(callSid) || {
    callSid: callSid || `call_${Date.now()}`,
    callerPhone: '+919876543210',
    latitude: 18.5793,
    longitude: 73.9824,
  };

  const symptoms: Record<string, boolean> = {};
  if (digits === '1') {
    symptoms.high_fever = true;
    symptoms.salivation = true;
    symptoms.mouth_blisters = true;
    symptoms.hoof_lesions = true;
  } else if (digits === '2') {
    symptoms.skin_nodules = true;
    symptoms.high_fever = true;
  } else if (digits === '3') {
    symptoms.sudden_death = true;
    symptoms.unclotted_blood = true;
  }

  const triage = await evaluateSyndromicTriage({
    species,
    affected_count: 1,
    mortality_count: digits === '3' ? 1 : 0,
    symptoms,
  });

  const clusterCheck = await checkSpatioTemporalCluster(session.latitude || 18.5793, session.longitude || 73.9824, 5.0, 72);

  const reportId = `ivr_${Date.now()}`;
  const report: DiseaseReport = {
    id: reportId,
    client_report_id: `ivr_sid_${session.callSid}`,
    reporter_role: 'ivr_system',
    reporter_name: 'IVR Voice Caller',
    reporter_phone: session.callerPhone,
    latitude: session.latitude || 18.5793,
    longitude: session.longitude || 73.9824,
    species,
    affected_count: 1,
    mortality_count: digits === '3' ? 1 : 0,
    symptoms,
    suspected_disease: triage.suspected_disease,
    triage_severity: triage.triage_severity,
    confidence_score: triage.confidence_score,
    is_outbreak_cluster: clusterCheck.isCluster,
    status: 'reported',
    emergency_instructions: triage.emergency_instructions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveDiseaseReport(report);
  activeSessions.delete(callSid);

  // Return completion TwiML
  const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    आपकी रिपोर्ट दर्ज कर ली गई है। संभावित बीमारी: ${triage.suspected_disease}। 
    क्षेत्रीय पशु चिकित्सा अधिकारी को सूचित कर दिया गया है। कृपया बीमार पशु को तुरंत अलग रखें। 
    फार्मशील्ड में कॉल करने के लिए धन्यवाद।
  </Say>
  <Say language="en-IN">
    Your report has been logged. Immediate isolation is advised. Thank you.
  </Say>
  <Hangup/>
</Response>`;

  res.set('Content-Type', 'text/xml');
  return res.send(responseXml);
});

/**
 * POST /api/v1/ivr/sms-webhook
 * Ingest SMS format: REPORT <PINCODE> <SPECIES> <FEVER/SORES/DEATH>
 */
router.post('/ivr/sms-webhook', async (req: Request, res: Response) => {
  const body = (req.body.Body || req.body.message || req.body.text || '') as string;
  const fromPhone = (req.body.From || req.body.sender || '+919876543210') as string;

  // Regex pattern: REPORT <PINCODE> <SPECIES> <SYMPTOM>
  const match = body.trim().match(/REPORT\s+(\d{6})\s+(\w+)\s+(.+)/i);

  let pincode = '412207';
  let species = 'cow';
  let symptomKeyword = 'sores';

  if (match) {
    pincode = match[1];
    species = match[2].toLowerCase();
    symptomKeyword = match[3].toLowerCase();
  }

  const symptoms: Record<string, boolean> = {};
  let mortality = 0;

  if (symptomKeyword.includes('death') || symptomKeyword.includes('die')) {
    symptoms.sudden_death = true;
    symptoms.unclotted_blood = true;
    mortality = 1;
  } else if (symptomKeyword.includes('sore') || symptomKeyword.includes('blister') || symptomKeyword.includes('fmd')) {
    symptoms.mouth_blisters = true;
    symptoms.salivation = true;
    symptoms.hoof_lesions = true;
  } else if (symptomKeyword.includes('lump') || symptomKeyword.includes('nodule') || symptomKeyword.includes('skin')) {
    symptoms.skin_nodules = true;
    symptoms.high_fever = true;
  } else {
    symptoms.high_fever = true;
  }

  const triage = await evaluateSyndromicTriage({
    species,
    affected_count: 1,
    mortality_count: mortality,
    symptoms,
  });

  const reportId = `sms_${Date.now()}`;
  const report: DiseaseReport = {
    id: reportId,
    client_report_id: `sms_${reportId}`,
    reporter_role: 'ivr_system',
    reporter_name: `SMS Farmer (${fromPhone})`,
    reporter_phone: fromPhone,
    latitude: 18.5793,
    longitude: 73.9824,
    species,
    affected_count: 1,
    mortality_count: mortality,
    symptoms,
    suspected_disease: triage.suspected_disease,
    triage_severity: triage.triage_severity,
    confidence_score: triage.confidence_score,
    is_outbreak_cluster: false,
    status: 'reported',
    emergency_instructions: triage.emergency_instructions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveDiseaseReport(report);

  const replySms = `[FARMSHIELD] Report #${reportId} registered. Suspected: ${triage.suspected_disease} (${triage.triage_severity}). Advice: Isolate animal immediately. Nearest Vet Dispensary: Wagholi Vet Center. Helpline: 1800-VET-CARE.`;

  return res.json({
    status: 'success',
    report_id: report.id,
    suspected_disease: triage.suspected_disease,
    reply_sms: replySms,
  });
});

export default router;
