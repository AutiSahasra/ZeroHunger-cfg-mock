import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getRequests,
  syncWithBackendApi,
  createRequest as apiCreateRequest,
  acceptRequest as apiAcceptRequest,
  updateRequestStatus as apiUpdateStatus,
  rejectRequest as apiRejectRequest,
  submitDeliveryProof as apiSubmitProof,
  cancelRequest as apiCancelRequest,
  getNotifications,
  markNotificationRead,
  getHotspots,
  getPriorityWeights,
  savePriorityWeights,
  getMessages,
  sendChatMessage as apiSendMessage
} from '../services/storageService';
import { calculateDistanceKm, calculatePriorityScore } from '../services/priorityEngine';
import { useAuth } from './AuthContext';

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const { currentUser, selectedCity } = useAuth();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [priorityWeights, setWeightsState] = useState({ distanceWeight: 0.5, quantityWeight: 0.5 });
  const [activeChatRequestId, setActiveChatRequestId] = useState(null);
  const [currentChatMessages, setCurrentChatMessages] = useState([]);

  const refreshData = async () => {
    const liveReqs = await syncWithBackendApi();
    const reqs = liveReqs || getRequests();
    setRequests(reqs);
    setNotifications(getNotifications(currentUser?.id));
    setHotspots(getHotspots());
    setWeightsState(getPriorityWeights());
  };

  useEffect(() => {
    refreshData();
    // Simulate real-time polling / socket listeners
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [currentUser, selectedCity]);

  // Load chat messages when activeChatRequestId changes
  useEffect(() => {
    if (activeChatRequestId) {
      setCurrentChatMessages(getMessages(activeChatRequestId));
    } else {
      setCurrentChatMessages([]);
    }
  }, [activeChatRequestId]);

  const updateWeights = (newWeights) => {
    setWeightsState(newWeights);
    savePriorityWeights(newWeights);
  };

  // Get prioritized available requests for a volunteer
  const getPrioritizedAvailableRequests = (volunteerLat, volunteerLng) => {
    const pendingReqs = requests.filter(
      r => r.status === 'PENDING' && (!selectedCity || r.cityId === selectedCity)
    );

    return pendingReqs
      .map(req => {
        const distKm = calculateDistanceKm(
          volunteerLat || 13.0200,
          volunteerLng || 80.2250,
          req.pickupLat,
          req.pickupLng
        );
        const priorityData = calculatePriorityScore(
          distKm,
          req.servings,
          priorityWeights.distanceWeight,
          priorityWeights.quantityWeight
        );
        return {
          ...req,
          calculatedDistanceKm: distKm,
          priorityScore: priorityData.compositeScore,
          distanceScore: priorityData.distanceScore,
          quantityScore: priorityData.quantityScore,
          urgencyTier: priorityData.urgencyTier
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  };

  // Actions
  const handleCreateRequest = (formData) => {
    const newReq = apiCreateRequest(formData, currentUser);
    refreshData();
    return newReq;
  };

  const handleAcceptRequest = (requestId) => {
    const updated = apiAcceptRequest(requestId, currentUser);
    refreshData();
    return updated;
  };

  const handleUpdateStatus = (requestId, newStatus, notes) => {
    const updated = apiUpdateStatus(requestId, newStatus, currentUser, notes);
    refreshData();
    return updated;
  };

  const handleRejectRequest = (requestId, reason) => {
    const updated = apiRejectRequest(requestId, currentUser, reason);
    refreshData();
    return updated;
  };

  const handleSubmitProof = (requestId, proofData) => {
    const updated = apiSubmitProof(requestId, currentUser, proofData);
    refreshData();
    return updated;
  };

  const handleCancelRequest = (requestId, reason) => {
    const updated = apiCancelRequest(requestId, currentUser, reason);
    refreshData();
    return updated;
  };

  const handleSendMessage = (text) => {
    if (!activeChatRequestId || !currentUser) return;
    const msg = apiSendMessage(activeChatRequestId, currentUser, text);
    setCurrentChatMessages(prev => [...prev, msg]);
    return msg;
  };

  const handleMarkNotifRead = (id) => {
    markNotificationRead(id);
    refreshData();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <RequestContext.Provider
      value={{
        requests,
        notifications,
        unreadCount,
        hotspots,
        priorityWeights,
        updateWeights,
        activeChatRequestId,
        setActiveChatRequestId,
        currentChatMessages,
        getPrioritizedAvailableRequests,
        createRequest: handleCreateRequest,
        acceptRequest: handleAcceptRequest,
        updateStatus: handleUpdateStatus,
        rejectRequest: handleRejectRequest,
        submitDeliveryProof: handleSubmitProof,
        cancelRequest: handleCancelRequest,
        sendMessage: handleSendMessage,
        markNotifRead: handleMarkNotifRead,
        refreshData
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => useContext(RequestContext);
