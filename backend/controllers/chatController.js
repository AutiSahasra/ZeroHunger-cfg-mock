const mongoose = require('mongoose');
const Message = require('../models/Message');
const FoodRequest = require('../models/FoodRequest');

// @desc    Get all chat messages for a food rescue request
// @route   GET /api/messages/:requestId
exports.getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestFilter = mongoose.Types.ObjectId.isValid(requestId)
      ? { $in: [requestId, new mongoose.Types.ObjectId(requestId)] }
      : requestId;
    const messages = await Message.find({ request: requestFilter })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching chat messages',
      error: error.message
    });
  }
};

// @desc    Send a message between donor and volunteer
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { requestId, content, senderId, senderName, senderRole } = req.body;
    const sender = senderId || req.user?._id || 'vol-1';

    if (!requestId || !content) {
      return res.status(400).json({
        success: false,
        message: 'requestId and content are required'
      });
    }

    const message = await Message.create({
      request: requestId,
      sender,
      senderName: senderName || req.user?.name || 'Volunteer',
      senderRole: senderRole || req.user?.role || 'VOLUNTEER',
      content: content.trim()
    });

    // Broadcast via socket.io to real-time clients
    const io = req.app.get('io');
    if (io) {
      io.to(requestId).emit('receive_message', message);
    }

    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};
