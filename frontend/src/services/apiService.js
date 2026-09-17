import apiClient from './apiClient';

export function formatRequest(r) {
  if (!r) return null;
  // if already formatted
  if (r.title && !r.foodDetails) return r;

  return {
    id: r._id || r.id,
    _id: r._id || r.id,
    title: r.foodDetails?.foodType || r.title || 'Surplus Food',
    foodType: r.foodDetails?.foodType || r.foodType || 'Cooked Meals',
    category: r.foodDetails?.category || r.category || 'Cooked Hot Meals',
    dietary: r.foodDetails?.dietary || r.dietary || 'Vegetarian',
    instructions: r.foodDetails?.instructions || r.instructions || '',
    photoUrl: r.foodDetails?.photoUrl || r.photoUrl || '',
    servings: r.quantity || r.servings || 0,
    quantityKg: r.quantityKg || (r.quantity ? Math.round(r.quantity * 0.4) : r.quantityKg),
    donorId: r.donor?._id ? r.donor._id : (r.donor || r.donorId),
    donorName: r.donor?.name || r.donorName || 'Registered Donor',
    donorPhone: r.donor?.phone || r.donorPhone || '',
    pickupAddress: r.pickupLocation?.address || r.pickupAddress || 'Pickup Location',
    pickupLat: r.pickupLocation?.coordinates?.coordinates ? r.pickupLocation.coordinates.coordinates[1] : (r.pickupLat || 13.0105),
    pickupLng: r.pickupLocation?.coordinates?.coordinates ? r.pickupLocation.coordinates.coordinates[0] : (r.pickupLng || 80.2207),
    regionId: r.region?._id || r.region || r.regionId,
    regionName: r.region?.name || r.regionName,
    status: r.status,
    assignedVolunteerId: r.assignedVolunteer?._id ? r.assignedVolunteer._id : (r.assignedVolunteer || r.assignedVolunteerId),
    assignedVolunteerName: r.assignedVolunteer?.name || r.assignedVolunteerName,
    createdAt: r.createdAt,
    goldenHourExpiresInHours: r.foodDetails?.goldenHourExpiresInHours || r.goldenHourExpiresInHours || 3
  };
}

export async function getRequests() {
  const res = await apiClient.get('/requests');
  const arr = res.data.data || res.data;
  return Array.isArray(arr) ? arr.map(formatRequest) : [];
}

export async function getRequestDetails(requestId) {
  const res = await apiClient.get(`/requests/${requestId}`);
  const r = res.data.data || res.data;
  
  const formatted = formatRequest(r);
  
  // Attach the extra history/proof fields
  if (formatted) {
    formatted.statusHistory = r.statusHistory || [];
    formatted.deliveryProof = r.deliveryProof || null;
  }
  return formatted;
}

export async function createRequest(formData) {
  const res = await apiClient.post('/requests', formData);
  return formatRequest(res.data.data || res.data);
}

export async function acceptRequest(requestId) {
  const res = await apiClient.post(`/requests/${requestId}/accept`);
  return formatRequest(res.data.data || res.data);
}

export async function updateRequestStatus(requestId, status, notes) {
  const res = await apiClient.patch(`/requests/${requestId}/status`, { status, notes });
  return formatRequest(res.data.data || res.data);
}

export async function rejectRequest(requestId, reason) {
  const res = await apiClient.post(`/requests/${requestId}/reject`, { reason });
  return formatRequest(res.data.data || res.data);
}

export async function submitDeliveryProof(requestId, proofData) {
  // Map frontend form fields to the backend schema
  const payload = {
    deliveryLocation: {
      address: proofData.deliverySpotName,
      coordinates: [proofData.deliveryLng, proofData.deliveryLat]
    },
    foodImages: proofData.foodPhotoUrl,
    deliverySpotImages: proofData.spotPhotoUrl,
    notes: proofData.volunteerNotes
  };
  const res = await apiClient.post(`/requests/${requestId}/delivery-proof`, payload);
  return formatRequest(res.data.data || res.data);
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  // Combine base URL with relative path to get absolute image URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const urlBase = backendUrl.replace('/api', '');
  return `${urlBase}${res.data.url}`;
}

export async function cancelRequest(requestId, reason) {
  const res = await apiClient.post(`/requests/${requestId}/cancel`, { reason });
  return formatRequest(res.data.data || res.data);
}

// Stubs for remaining mock functions that aren't fully implemented on backend yet
export async function getNotifications() {
  try {
    const res = await apiClient.get('/notifications');
    return res.data.data || res.data || [];
  } catch(e) {
    return [];
  }
}
export async function markNotificationRead(id) {
  try {
    await apiClient.patch(`/notifications/${id}/read`);
  } catch(e) {
    console.error('Failed to mark notification as read', e);
  }
}
export async function getHotspots() {
  try {
    const res = await apiClient.get('/maps/hotspots');
    return res.data.data || res.data || [];
  } catch(e) {
    return [];
  }
}
export async function getPriorityWeights() {
  return { distanceWeight: 0.5, quantityWeight: 0.5 };
}
export async function savePriorityWeights() {}
export async function getMessages(requestId) {
  if (!requestId) return [];
  try {
    const res = await apiClient.get(`/messages/${requestId}`);
    return res.data.data || res.data || [];
  } catch(e) {
    return [];
  }
}
export async function sendChatMessage(requestId, text) {
  const res = await apiClient.post(`/messages`, { requestId, content: text });
  return res.data.data || res.data;
}
