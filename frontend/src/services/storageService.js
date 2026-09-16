// Storage and Mock Backend Service
// Implements TRD Section 3, 5, 6, 7, 8, 9, 10, 11 (State & Data Integrity)

import {
  INITIAL_CITIES,
  INITIAL_REGIONS,
  INITIAL_USERS,
  INITIAL_REQUESTS,
  INITIAL_HOTSPOTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'nfw_users',
  REQUESTS: 'nfw_requests',
  CITIES: 'nfw_cities',
  REGIONS: 'nfw_regions',
  HOTSPOTS: 'nfw_hotspots',
  MESSAGES: 'nfw_messages',
  NOTIFICATIONS: 'nfw_notifications',
  WEIGHTS: 'nfw_priority_weights'
};

// Initialize default storage if empty
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CITIES)) {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REGIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGIONS, JSON.stringify(INITIAL_REGIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HOTSPOTS)) {
    localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(INITIAL_HOTSPOTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WEIGHTS)) {
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify({ distanceWeight: 0.5, quantityWeight: 0.5 }));
  }
}

// Data Getters
export function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

export function getRequests() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
}

export function getCities() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CITIES) || '[]');
}

export function getRegions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGIONS) || '[]');
}

export function getHotspots() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.HOTSPOTS) || '[]');
}

export function getMessages(requestId = null) {
  const msgs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  if (!requestId) return msgs;
  return msgs.filter(m => m.requestId === requestId);
}

export function getNotifications(userId = null) {
  const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  if (!userId) return notifs;
  return notifs.filter(n => !n.userId || n.userId === userId);
}

export function getPriorityWeights() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WEIGHTS) || '{"distanceWeight":0.5,"quantityWeight":0.5}');
}

export function savePriorityWeights(weights) {
  localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
}

// Request Operations (Donor & Volunteer)
export function createRequest(newReqData, donorUser) {
  const requests = getRequests();
  const newRequest = {
    id: `req-${Date.now().toString().slice(-4)}`,
    title: newReqData.title,
    foodType: newReqData.foodType,
    category: newReqData.category || 'Cooked Hot Meals',
    dietary: newReqData.dietary || 'Vegetarian',
    servings: Number(newReqData.servings),
    quantityKg: Number(newReqData.quantityKg || Math.round(newReqData.servings * 0.4)),
    donorId: donorUser.id,
    donorName: donorUser.name,
    donorPhone: donorUser.phone,
    pickupAddress: newReqData.pickupAddress,
    pickupLat: Number(newReqData.pickupLat || donorUser.lat || 13.0400),
    pickupLng: Number(newReqData.pickupLng || donorUser.lng || 80.2300),
    cityId: donorUser.cityId || 'chennai',
    regionId: donorUser.regionId || 'reg-chn-1',
    cookedTime: 'Just cooked (fresh)',
    goldenHourExpiresInHours: Number(newReqData.goldenHourExpiresInHours || 3.0),
    instructions: newReqData.instructions || '',
    photoUrl: newReqData.photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    status: 'PENDING',
    assignedVolunteerId: null,
    assignedVolunteerName: null,
    createdAt: new Date().toISOString(),
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        actor: donorUser.name,
        reason: 'Surplus food rescue request posted'
      }
    ]
  };

  requests.unshift(newRequest);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Add system notification for volunteers
  addNotification({
    userId: null,
    title: 'New Food Rescue Available!',
    message: `${newRequest.servings} servings available at ${newRequest.pickupAddress}.`,
    requestId: newRequest.id,
    type: 'NEW_REQUEST'
  });

  return newRequest;
}

// Atomic Accept Request (TRD Section 7 & 11)
export function acceptRequest(requestId, volunteerUser) {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index === -1) throw new Error('Request not found');
  if (requests[index].status !== 'PENDING') {
    throw new Error('This request is no longer pending or has already been accepted.');
  }

  // Atomic state change
  requests[index].status = 'ACCEPTED';
  requests[index].assignedVolunteerId = volunteerUser.id;
  requests[index].assignedVolunteerName = volunteerUser.name;
  requests[index].assignedVolunteerPhone = volunteerUser.phone;
  requests[index].assignedAt = new Date().toISOString();
  requests[index].statusHistory.push({
    status: 'ACCEPTED',
    timestamp: new Date().toISOString(),
    actor: `${volunteerUser.name} (Volunteer)`,
    reason: 'Claimed request and started navigation to pickup location'
  });

  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Sync to MongoDB backend
  try {
    fetch(`http://localhost:5000/api/requests/${requestId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': volunteerUser.id }
    }).catch(e => console.warn('MongoDB sync note:', e.message));
  } catch (e) {}

  // Notify Donor
  addNotification({
    userId: requests[index].donorId,
    title: 'Volunteer Assigned!',
    message: `${volunteerUser.name} accepted your request "${requests[index].title}".`,
    requestId,
    type: 'ASSIGNMENT'
  });

  return requests[index];
}

// Update Status (Intermediate: IN_PROGRESS)
export function updateRequestStatus(requestId, newStatus, user, notes = '') {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  requests[index].status = newStatus;
  requests[index].statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    actor: `${user.name} (${user.role})`,
    reason: notes || `Status updated to ${newStatus}`
  });

  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Sync to MongoDB backend
  try {
    fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ status: newStatus, notes })
    }).catch(e => console.warn('MongoDB sync note:', e.message));
  } catch (e) {}

  // Notify donor
  addNotification({
    userId: requests[index].donorId,
    title: `Mission Update: ${newStatus}`,
    message: `Your food donation has progressed to status: ${newStatus}.`,
    requestId,
    type: 'STATUS_CHANGE'
  });

  return requests[index];
}

// Reject / Reopen Request (TRD Section 7)
export function rejectRequest(requestId, volunteerUser, reason) {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  // Reopen to pending
  requests[index].status = 'PENDING';
  requests[index].assignedVolunteerId = null;
  requests[index].assignedVolunteerName = null;
  requests[index].statusHistory.push({
    status: 'PENDING',
    timestamp: new Date().toISOString(),
    actor: `${volunteerUser.name} (Volunteer Cancelled)`,
    reason: reason || 'Volunteer had to cancel mission; reopened to available queue'
  });

  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Sync to MongoDB backend
  try {
    fetch(`http://localhost:5000/api/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': volunteerUser.id },
      body: JSON.stringify({ reason })
    }).catch(e => console.warn('MongoDB sync note:', e.message));
  } catch (e) {}

  addNotification({
    userId: requests[index].donorId,
    title: 'Mission Reopened',
    message: `Volunteer was unable to complete pickup (${reason}). Reopened for other volunteers.`,
    requestId,
    type: 'REOPENED'
  });

  return requests[index];
}

// Submit Delivery Proof (TRD Section 7 & 15)
export function submitDeliveryProof(requestId, volunteerUser, proofData) {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  const deliveryProof = {
    deliverySpotName: proofData.deliverySpotName || 'Designated Community Center',
    deliveryLat: Number(proofData.deliveryLat || 13.0500),
    deliveryLng: Number(proofData.deliveryLng || 80.2400),
    beneficiariesFed: Number(proofData.beneficiariesFed || requests[index].servings),
    deliveryTimestamp: new Date().toISOString(),
    foodPhotoUrl: proofData.foodPhotoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    spotPhotoUrl: proofData.spotPhotoUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60',
    volunteerNotes: proofData.volunteerNotes || 'Delivered safely and inspected for food hygiene.'
  };

  requests[index].status = 'DELIVERED';
  requests[index].deliveredAt = new Date().toISOString();
  requests[index].deliveryProof = deliveryProof;
  requests[index].statusHistory.push({
    status: 'DELIVERED',
    timestamp: new Date().toISOString(),
    actor: `${volunteerUser.name} (Volunteer)`,
    reason: `Delivered to ${deliveryProof.deliverySpotName} with verified photographic & GPS proof.`
  });

  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

  // Sync to MongoDB backend
  try {
    fetch(`http://localhost:5000/api/requests/${requestId}/delivery-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': volunteerUser.id },
      body: JSON.stringify({
        deliveryLocation: {
          address: deliveryProof.deliverySpotName,
          coordinates: [deliveryProof.deliveryLng, deliveryProof.deliveryLat]
        },
        foodImages: [deliveryProof.foodPhotoUrl],
        deliverySpotImages: [deliveryProof.spotPhotoUrl],
        notes: deliveryProof.volunteerNotes
      })
    }).catch(e => console.warn('MongoDB sync note:', e.message));
  } catch (e) {}

  // Update volunteer stats
  updateVolunteerStats(volunteerUser.id, requests[index].quantityKg);

  // Update or add Hotspot delivery point
  recordHotspotDelivery(deliveryProof.deliverySpotName, deliveryProof.deliveryLat, deliveryProof.deliveryLng, requests[index].servings);

  // Notify Donor
  addNotification({
    userId: requests[index].donorId,
    title: 'Food Successfully Delivered! 🌟',
    message: `Your donation of ${requests[index].servings} meals has been delivered to ${deliveryProof.deliverySpotName}!`,
    requestId,
    type: 'DELIVERED'
  });

  return requests[index];
}

// Cancel Request (Donor only while PENDING)
export function cancelRequest(requestId, donorUser, reason = 'Cancelled by donor') {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Request not found');

  if (requests[index].status !== 'PENDING') {
    throw new Error('Only requests with PENDING status can be cancelled.');
  }

  requests[index].status = 'CANCELLED';
  requests[index].statusHistory.push({
    status: 'CANCELLED',
    timestamp: new Date().toISOString(),
    actor: donorUser.name,
    reason
  });

  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return requests[index];
}

// Volunteer stats updater
function updateVolunteerStats(volunteerId, addedKg) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === volunteerId);
  if (index !== -1) {
    users[index].deliveriesCompleted = (users[index].deliveriesCompleted || 0) + 1;
    users[index].foodDeliveredKg = (users[index].foodDeliveredKg || 0) + Number(addedKg || 10);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

// Hotspot aggregation updater (TRD Section 16 & 17)
function recordHotspotDelivery(spotName, lat, lng, meals) {
  const hotspots = getHotspots();
  const existing = hotspots.find(h => 
    Math.abs(h.lat - lat) < 0.01 && Math.abs(h.lng - lng) < 0.01
  );

  if (existing) {
    existing.deliveriesCount += 1;
    existing.totalMealsReceived += Number(meals || 30);
    existing.lastDelivery = 'Just now';
  } else {
    hotspots.push({
      id: `hotspot-${Date.now().toString().slice(-4)}`,
      name: spotName,
      cityId: 'chennai',
      lat,
      lng,
      deliveriesCount: 1,
      totalMealsReceived: Number(meals || 30),
      urgencyLevel: 'MEDIUM',
      description: 'Newly registered community distribution point',
      lastDelivery: 'Just now'
    });
  }

  localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(hotspots));
}

// Chat Messages (TRD Section 9)
export function sendChatMessage(requestId, senderUser, text) {
  const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  const newMessage = {
    id: `msg-${Date.now()}`,
    requestId,
    senderId: senderUser.id,
    senderName: senderUser.name,
    senderRole: senderUser.role,
    text,
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

  // Sync to MongoDB database
  try {
    fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        senderId: senderUser.id,
        senderName: senderUser.name,
        senderRole: senderUser.role,
        content: text
      })
    }).catch(err => console.warn('MongoDB sync note:', err.message));
  } catch (e) {}

  return newMessage;
}

// Notifications (TRD Section 10)
export function addNotification({ userId, title, message, requestId, type }) {
  const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  const newNotif = {
    id: `notif-${Date.now()}`,
    userId: userId || null,
    title,
    message,
    requestId: requestId || null,
    type: type || 'GENERAL',
    read: false,
    timestamp: new Date().toISOString()
  };
  notifs.unshift(newNotif);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  return newNotif;
}

export function markNotificationRead(notifId) {
  const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  const index = notifs.findIndex(n => n.id === notifId);
  if (index !== -1) {
    notifs[index].read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
}

// Admin Volunteer Management
export function setVolunteerApproval(volunteerId, approve = true) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === volunteerId);
  if (index !== -1) {
    users[index].status = approve ? 'ACTIVE' : 'DEACTIVATED';
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  return users;
}

// Reset data to initial demo state
export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(INITIAL_HOTSPOTS));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
}
