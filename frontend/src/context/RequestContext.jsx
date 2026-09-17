import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
  getRequests,
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
  sendChatMessage as apiSendMessage,
  formatRequest,
  getRequestDetails as apiGetRequestDetails
} from '../services/apiService';
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
  const [socket, setSocket] = useState(null);

  const refreshData = async () => {
    try {
      const reqs = await getRequests();
      setRequests(reqs || []);
      const notifs = await getNotifications(currentUser?.id || currentUser?._id);
      setNotifications(notifs || []);
      const hots = await getHotspots();
      setHotspots(hots || []);
      const weights = await getPriorityWeights();
      setWeightsState(weights);
    } catch(err) {
      console.error("Failed to refresh data", err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    refreshData();
    
    // WebSocket Integration
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('new_food_request', (newReq) => {
      const formattedReq = formatRequest(newReq);
      setRequests(prev => [formattedReq, ...prev]);
    });

    newSocket.on('request_status_updated', (updatedReq) => {
      const formattedReq = formatRequest(updatedReq);
      setRequests(prev => prev.map(r => (r._id === formattedReq._id || r.id === formattedReq.id) ? formattedReq : r));
    });
    


    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, selectedCity]);

  // Load chat messages when activeChatRequestId changes
  useEffect(() => {
    if (activeChatRequestId) {
      const fetchMsgs = async () => {
        const msgs = await getMessages(activeChatRequestId);
        setCurrentChatMessages(msgs || []);
      };
      fetchMsgs();
      
      // Join room for this specific request if socket exists
      let messageHandler = null;
      if (socket) {
         socket.emit('join_room', activeChatRequestId);
         
         messageHandler = (msg) => {
           if (msg.request === activeChatRequestId || String(msg.request) === String(activeChatRequestId)) {
             setCurrentChatMessages(prev => [...prev, msg]);
           }
         };
         socket.on('receive_message', messageHandler);
      }
      
      return () => {
        if (socket && activeChatRequestId) {
          socket.emit('leave_room', activeChatRequestId);
          if (messageHandler) {
            socket.off('receive_message', messageHandler);
          }
        }
      }
    } else {
      setCurrentChatMessages([]);
    }
  }, [activeChatRequestId, socket]);

  const updateWeights = async (newWeights) => {
    setWeightsState(newWeights);
    await savePriorityWeights(newWeights);
  };

  const getPrioritizedAvailableRequests = (volunteerLat, volunteerLng) => {
    const pendingReqs = requests.filter(
      r => r.status === 'PENDING'
    );

    return pendingReqs
      .map(req => {
        const distKm = calculateDistanceKm(
          volunteerLat || 13.0200,
          volunteerLng || 80.2250,
          req.pickupLocation?.coordinates?.coordinates?.[1] || req.pickupLat,
          req.pickupLocation?.coordinates?.coordinates?.[0] || req.pickupLng
        );
        const priorityData = calculatePriorityScore(
          distKm,
          req.quantity,
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

  const handleCreateRequest = async (formData) => {
    const newReq = await apiCreateRequest(formData);
    // Real-time backend will broadcast, but we can optimistically update
    setRequests(prev => [newReq, ...prev]);
    return newReq;
  };

  const handleGetRequestDetails = async (requestId) => {
    return await apiGetRequestDetails(requestId);
  };

  const handleAcceptRequest = async (requestId) => {
    const updated = await apiAcceptRequest(requestId);
    setRequests(prev => prev.map(r => (r._id === requestId || r.id === requestId) ? updated : r));
    return updated;
  };

  const handleUpdateStatus = async (requestId, newStatus, notes) => {
    const updated = await apiUpdateStatus(requestId, newStatus, notes);
    setRequests(prev => prev.map(r => (r._id === requestId || r.id === requestId) ? updated : r));
    return updated;
  };

  const handleRejectRequest = async (requestId, reason) => {
    const updated = await apiRejectRequest(requestId, reason);
    setRequests(prev => prev.map(r => (r._id === requestId || r.id === requestId) ? updated : r));
    return updated;
  };

  const handleSubmitProof = async (requestId, proofData) => {
    const updated = await apiSubmitProof(requestId, proofData);
    setRequests(prev => prev.map(r => (r._id === requestId || r.id === requestId) ? updated : r));
    return updated;
  };

  const handleCancelRequest = async (requestId, reason) => {
    const updated = await apiCancelRequest(requestId, reason);
    setRequests(prev => prev.map(r => (r._id === requestId || r.id === requestId) ? updated : r));
    return updated;
  };

  const handleSendMessage = async (text) => {
    if (!activeChatRequestId || !currentUser) return;
    
    // Using WebSocket to send message directly for faster response
    if (socket) {
       socket.emit('send_message', {
         requestId: activeChatRequestId,
         senderId: currentUser.id || currentUser._id,
         senderName: currentUser.name,
         senderRole: currentUser.role,
         content: text
       });
    } else {
       await apiSendMessage(activeChatRequestId, text);
    }
  };

  const handleMarkNotifRead = async (id) => {
    await markNotificationRead(id);
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
        getRequestDetails: handleGetRequestDetails,
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
