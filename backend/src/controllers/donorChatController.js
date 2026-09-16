const mongoose = require('mongoose');
const Message = require('../models/Message');
const FoodRequest = require('../models/FoodRequest');

// @desc    Get chat message history for a request
// @route   GET /api/requests/:id/messages
// @access  Private (Donor only)
exports.getMessages = async (req, res, next) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found.'
      });
    }

    // Verify donor access
    const requestDonorId = request.donor?._id || request.donor;
    if (requestDonorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this conversation.'
      });
    }

    const reqId = req.params.id;
    const requestFilter = mongoose.Types.ObjectId.isValid(reqId)
      ? { $in: [reqId, new mongoose.Types.ObjectId(reqId)] }
      : reqId;

    const messages = await Message.find({ request: requestFilter })
      .populate('sender', 'name role phone')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a request chat
// @route   POST /api/requests/:id/messages
// @access  Private (Donor only)
exports.sendMessage = async (req, res, next) => {
  try {
    const { text, content } = req.body;
    const messageContent = (text || content || '').trim();

    if (!messageContent) {
      return res.status(400).json({
        success: false,
        message: 'Message text/content cannot be empty.'
      });
    }

    const request = await FoodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found.'
      });
    }

    // Verify donor access
    const requestDonorId = request.donor?._id || request.donor;
    if (requestDonorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to post messages to this request.'
      });
    }

    const message = await Message.create({
      request: request._id,
      sender: req.user._id,
      content: messageContent
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name role phone'
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
};
