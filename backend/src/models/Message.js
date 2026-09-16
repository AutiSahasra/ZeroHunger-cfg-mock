const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message text / content is required'],
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

messageSchema.virtual('requestId').get(function () {
  return this.request;
});

messageSchema.virtual('senderId').get(function () {
  return this.sender?._id || this.sender;
});

messageSchema.virtual('text').get(function () {
  return this.content;
});

messageSchema.index({ request: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema, 'messages');
