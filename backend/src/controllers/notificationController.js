const Notification = require('../models/Notification');

// @desc    Get donor notifications
// @route   GET /api/notifications
// @access  Private (Donor)
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }]
    })
      .populate('request', 'foodDetails status quantity')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: req.user._id }, { recipient: null }],
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Donor)
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for current donor
// @route   PATCH /api/notifications/read-all
// @access  Private (Donor)
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipient: null }], isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};
