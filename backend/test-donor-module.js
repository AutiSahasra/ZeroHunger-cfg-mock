const dotenv = require('dotenv');
dotenv.config();

async function runTests() {
  console.log(`\n==============================================`);
  console.log(`🧪 Running Donor Module & Google Maps API Verification`);
  console.log(`   Connected to MongoDB Atlas: [zerohunger]`);
  console.log(`==============================================\n`);

  const baseUrl = `http://localhost:5000`;
  let donorToken = '';
  let requestId = '';

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ONLINE', 'Health check returns status ONLINE');

    // 2. Google Maps Config
    const mapConfigRes = await fetch(`${baseUrl}/api/maps/config`);
    const mapConfig = await mapConfigRes.json();
    assert(mapConfigRes.status === 200 && mapConfig.data.provider === 'google-maps', 'Google Maps Config endpoint returns provider google-maps');
    assert(typeof mapConfig.data.apiKey === 'string', 'Google Maps API Key is exposed in config for frontend Google Maps JS API');
    assert(Array.isArray(mapConfig.data.availableFeatures), 'Google Maps available features list returned');

    // 4. Google Maps Static Map Preview
    const staticMapRes = await fetch(`${baseUrl}/api/maps/static-preview?lat=13.0105&lng=80.2207`);
    const staticMapData = await staticMapRes.json();
    assert(staticMapRes.status === 200 && staticMapData.data.staticMapUrl.includes('maps.googleapis.com/maps/api/staticmap'), 'GET /api/maps/static-preview generates Google Static Map image URL');

    // 5. Existing Donor Login from Atlas database (ITC Grand Chola)
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'banquets@itcgrandchola.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success && loginData.token, 'Existing donor from Atlas zerohunger DB logged in successfully');
    donorToken = loginData.token;

    // 3b. Google Maps Places Autocomplete (Authenticated)
    const placesRes = await fetch(`${baseUrl}/api/maps/places/autocomplete?input=Grand%20Chola`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const placesData = await placesRes.json();
    assert(placesRes.status === 200 && Array.isArray(placesData.data), 'GET /api/maps/places/autocomplete returns search predictions for donor venues');

    // 6. Get Current User Profile (auth/me)
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.role === 'DONOR', 'GET /api/auth/me returns authenticated DONOR profile');
    assert(meData.user.name === 'ITC Grand Chola Banquets', 'Profile reflects exact donor name from zerohunger database');

    // 7. Google Maps Forward Geocoding
    const geocodeRes = await fetch(`${baseUrl}/api/maps/geocode?address=63%20Mount%20Road%20Guindy%20Chennai`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const geocodeData = await geocodeRes.json();
    assert(geocodeRes.status === 200 && geocodeData.data.lat !== undefined, 'GET /api/maps/geocode geocodes pickup address to GPS coordinates');

    // 8. Google Maps Reverse Geocoding
    const revGeocodeRes = await fetch(`${baseUrl}/api/maps/reverse-geocode?lat=13.0105&lng=80.2207`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const revGeocodeData = await revGeocodeRes.json();
    assert(revGeocodeRes.status === 200 && typeof revGeocodeData.data.formattedAddress === 'string', 'GET /api/maps/reverse-geocode converts coordinates to street address');

    // 9. Google Maps Distance Matrix
    const distRes = await fetch(`${baseUrl}/api/maps/distance?originLat=13.0105&originLng=80.2207&destLat=13.0418&destLng=80.2341`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const distData = await distRes.json();
    assert(distRes.status === 200 && distData.data.distanceKm !== undefined, 'GET /api/maps/distance calculates distance and travel duration via Google Maps Distance Matrix');

    // 10. Create Surplus Food Request (stored in foodrequests collection in Atlas)
    const createReqRes = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        title: '75 Portions — South Indian Special Thali',
        foodType: 'Cooked Hot Meals',
        description: 'Fresh banquet surplus packed in insulated food containers',
        servings: 75,
        quantityKg: 30,
        pickupAddress: 'Loading Bay 3, ITC Grand Chola, Guindy, Chennai',
        pickupLat: 13.0105,
        pickupLng: 80.2207,
        goldenHourExpiresInHours: 2.5,
        instructions: 'Gate 2 security will assist vehicle loading.'
      })
    });
    const createReqData = await createReqRes.json();
    assert(createReqRes.status === 201 && createReqData.data.status === 'PENDING', 'Donor created PENDING food request saved in Atlas foodrequests');
    requestId = createReqData.data._id;

    // 11. Get Donor's Own Requests (/api/requests/mine)
    const mineRes = await fetch(`${baseUrl}/api/requests/mine`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const mineData = await mineRes.json();
    assert(mineRes.status === 200 && mineData.count >= 1, 'GET /api/requests/mine returns list of requests for this donor');

    // 12. Update Request while PENDING (TRD Section 6 & 11)
    const updateRes = await fetch(`${baseUrl}/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        title: '80 Portions — South Indian Special Thali (Updated)',
        servings: 80,
        quantityKg: 32
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data.quantity === 80, 'PATCH /api/requests/:id allows donor to update request while PENDING');

    // 13. Donor Stats (/api/donors/me/stats)
    const statsRes = await fetch(`${baseUrl}/api/donors/me/stats`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.data.kpis.totalRequests >= 1, 'GET /api/donors/me/stats calculates donor KPIs from Atlas data');
    assert(statsData.data.kpis.totalServings >= 80, 'Stats accurately sum servings from live database');

    // 14. Send Chat Message (REST endpoint, no socket.io)
    const sendMsgRes = await fetch(`${baseUrl}/api/requests/${requestId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        text: 'Food is packed and ready for volunteer pickup at gate 2.'
      })
    });
    const sendMsgData = await sendMsgRes.json();
    assert(sendMsgRes.status === 201 && sendMsgData.data.content.includes('Food is packed'), 'POST /api/requests/:id/messages successfully posts message into messages collection');

    // 15. Get Chat Messages
    const getMsgsRes = await fetch(`${baseUrl}/api/requests/${requestId}/messages`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const getMsgsData = await getMsgsRes.json();
    assert(getMsgsRes.status === 200 && getMsgsData.count >= 1, 'GET /api/requests/:id/messages returns chat history from messages collection');

    // 16. Notifications (/api/notifications)
    const notifsRes = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200 && Array.isArray(notifsData.data), 'GET /api/notifications retrieves donor alerts from notifications collection');

    // 17. Cancel Request while PENDING (TRD Section 6 & 11)
    const cancelRes = await fetch(`${baseUrl}/api/requests/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({ reason: 'Reallocated internally to on-duty staff' })
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200 && cancelData.data.status === 'CANCELLED', 'DELETE /api/requests/:id cancels request and sets status to CANCELLED in Atlas');

    // 18. State Integrity Check: Editing a CANCELLED request fails with 400
    const failUpdateRes = await fetch(`${baseUrl}/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({ title: 'Should fail' })
    });
    assert(failUpdateRes.status === 400, 'Data integrity enforced: Editing non-PENDING request rejected with HTTP 400');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log(`\n==============================================`);
    console.log(`📊 Test Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==============================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
