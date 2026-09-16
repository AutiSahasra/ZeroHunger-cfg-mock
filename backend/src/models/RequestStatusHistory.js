const mongoose = require('mongoose');

const requestStatusHistorySchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: true
    },
    oldStatus: {
      type: String,
      required: true
    },
    newStatus: {
      type: String,
      required: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RequestStatusHistory', requestStatusHistorySchema, 'requeststatushistories');
