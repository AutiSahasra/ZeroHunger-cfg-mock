const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      default: 'GENERAL'
    },
    message: {
      type: String,
      required: true
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

notificationSchema.virtual('userId').get(function () {
  return this.recipient;
});

notificationSchema.virtual('requestId').get(function () {
  return this.request;
});

notificationSchema.virtual('read').get(function () {
  return this.isRead;
});

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema, 'notifications');
