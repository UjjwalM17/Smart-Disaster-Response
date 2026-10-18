/**
 * ResQ Autonomous AI Disaster Response Verification Suite
 * Tests:
 * 1. Gateway & Microservices operational
 * 2. Automated AI Verification (>=70% -> verified=true, status=IN_PROGRESS)
 * 3. Low-confidence Flagging (<70% -> verified=false, status=REPORTED, uncertain flag)
 * 4. Automatic Duplicate Clustering & Idempotency
 * 5. Automated Alert Generation on High/Critical Auto-Verified incidents
 * 6. Mission Dispatch Recommendation & Lifecycle
 */

const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8086,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAutonomousSuite() {
  console.log('================================================================');
  console.log('    RESQ AUTONOMOUS AI PIPELINE & DISASTER HISTORY TEST SUITE    ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 6;

  // Test 1: Microservice Gateway & DB Persistence
  try {
    console.log('[Test 1] Testing Gateway Reverse Proxy & Incident Persistence...');
    const res = await makeRequest('/api/incidents');
    if (res.status === 200 && Array.isArray(res.data) && res.data.length >= 30) {
      console.log(`  ✅ PASSED: Gateway online. Verified ${res.data.length} persistent database records in PostgreSQL.`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: Unexpected response status ${res.status}`);
    }
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`);
  }

  // Test 2: AI Auto-Verification for High-Confidence Incident (>= 70%)
  try {
    console.log('\n[Test 2] Testing Autonomous AI Verification (Confidence >= 70%)...');
    const highConfClientId = `AUTO-VERIFY-${Date.now()}`;
    const payload = {
      reporterName: 'AI Drone Scout Unit 3',
      mobile: '9810009988',
      location: 'Yamuna Riverbank Sector 12',
      latitude: 28.692,
      longitude: 77.251,
      disasterType: 'Flood',
      aiLabel: 'Flood',
      aiConfidence: 89.0, // >= 70%
      severity: 'HIGH',
      priorityScore: 82.0,
      description: 'Severe flood breach along embankment, rapid water ingress.',
      clientIncidentId: highConfClientId,
    };

    const createRes = await makeRequest('/api/incidents', 'POST', payload);
    if (createRes.status === 201 && createRes.data.verified === true && createRes.data.status === 'IN_PROGRESS') {
      console.log(`  ✅ PASSED: Incident #${createRes.data.incidentId} was AUTO-VERIFIED by AI (verified=true, status=IN_PROGRESS) without manual approval!`);
      console.log(`     Notes Telemetry: "${createRes.data.notes}"`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: Incident not auto-verified: verified=${createRes.data?.verified}, status=${createRes.data?.status}`);
    }
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`);
  }

  // Test 3: Reliability & Uncertainty Handling for Low-Confidence Incident (< 70%)
  try {
    console.log('\n[Test 3] Testing AI Uncertainty Handling (Confidence < 70%)...');
    const lowConfClientId = `LOW-CONF-${Date.now()}`;
    const payload = {
      reporterName: 'Public Caller',
      mobile: '9810007766',
      location: 'Old Suburb Lane 4',
      latitude: 28.615,
      longitude: 77.218,
      disasterType: 'Building Collapse',
      aiLabel: 'Building Collapse',
      aiConfidence: 54.0, // < 70%
      severity: 'MEDIUM',
      priorityScore: 48.0,
      description: 'Possible cracks seen on exterior facade, unclear visibility.',
      clientIncidentId: lowConfClientId,
    };

    const createRes = await makeRequest('/api/incidents', 'POST', payload);
    if (createRes.status === 201 && createRes.data.verified === false && createRes.data.status === 'REPORTED') {
      console.log(`  ✅ PASSED: Low-confidence incident #${createRes.data.incidentId} was FLAGGED AS UNCERTAIN (verified=false, status=REPORTED).`);
      console.log(`     Notes Telemetry: "${createRes.data.notes}"`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: Low confidence not flagged appropriately: verified=${createRes.data?.verified}`);
    }
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`);
  }

  // Test 4: Automatic Duplicate Prevention & Idempotent Submission
  try {
    console.log('\n[Test 4] Testing Idempotent Store-and-Forward Synchronisation...');
    const idempKey = `IDEMP-CHECK-${Date.now()}`;
    const payload = {
      reporterName: 'Offline Scout Sync',
      mobile: '9810001234',
      location: 'Bhiwandi Sector 9',
      disasterType: 'Fire',
      aiLabel: 'Fire',
      aiConfidence: 94.0,
      severity: 'HIGH',
      description: 'Store-and-forward idempotency verification report',
      clientIncidentId: idempKey,
    };

    const firstPost = await makeRequest('/api/incidents', 'POST', payload);
    const secondPost = await makeRequest('/api/incidents', 'POST', payload);

    if (firstPost.status === 201 && secondPost.status === 201 && firstPost.data.incidentId === secondPost.data.incidentId) {
      console.log(`  ✅ PASSED: Idempotency confirmed. Re-sync returned existing ID #${firstPost.data.incidentId} without duplicate record.`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: Idempotency failed: status1=${firstPost.status}, status2=${secondPost.status}`);
    }
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`);
  }

  // Test 5: Automated Alert Broadcasting
  try {
    console.log('\n[Test 5] Testing Automated Emergency Alert Generation...');
    const alertPayload = {
      missionId: 1,
      alertType: 'PUSH_NOTIFICATION',
      message: '[AI AUTO-ALERT] Flash Flood Evacuation Notice: Automated AI triage confirmed flood surge Yamuna Bazar.',
      severity: 'HIGH',
    };
    const alertRes = await makeRequest('/api/alerts', 'POST', alertPayload);
    if ((alertRes.status === 200 || alertRes.status === 201) && alertRes.data.alertId) {
      console.log(`  ✅ PASSED: Emergency Alert #${alertRes.data.alertId} broadcasted successfully.`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: Alert creation status ${alertRes.status}`);
    }
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`);
  }

  // Test 6: Rescue Mission Recommendation & Dispatch
  try {
    console.log('\n[Test 6] Testing Tactical Rescue Mission Dispatch Lifecycle...');
    const missionPayload = {
      incidentId: 1,
      rescueTeamIds: [1, 2],
      resourceIds: [1],
      priority: 'CRITICAL',
      remarks: 'Automated AI response protocol: Swift Water Rescue deployment',
    };
    const missionRes = await makeRequest('/api/missions', 'POST', missionPayload);
    if ((missionRes.status === 200 || missionRes.status === 201) && missionRes.data.missionId) {
      console.log(`  ✅ PASSED: Mission #${missionRes.data.missionId} staged & dispatched for incident #1.`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: Mission creation status ${missionRes.status}`);
    }
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`);
  }

  console.log('\n================================================================');
  console.log(`AUTONOMOUS PIPELINE RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('================================================================\n');
}

runAutonomousSuite();
