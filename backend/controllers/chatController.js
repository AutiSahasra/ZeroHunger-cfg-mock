const Message = require('../models/Message');
const FoodRequest = require('../models/FoodRequest');

// @desc    Get all chat messages for a food rescue request
// @route   GET /api/messages/:requestId
exports.getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await Message.find({ request: requestId })
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
    const { requestId, content, senderId } = req.body;
    const sender = senderId || req.user?._id;

    if (!requestId || !content || !sender) {
      return res.status(400).json({
        success: false,
        message: 'requestId, sender and content are required'
      });
    }

    const message = await Message.create({
      request: requestId,
      sender,
      content: content.trim()
    });

    const populated = await Message.findById(message._id).populate('sender', 'name role');

    return res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};
