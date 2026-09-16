const mongoose = require("mongoose");

const requestStatusHistorySchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.Mixed,
      ref: "FoodRequest",
      required: true,
    },

    oldStatus: {
      type: String,
      required: true,
    },

    newStatus: {
      type: String,
      required: true,
    },

    actor: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

requestStatusHistorySchema.index({ request: 1, createdAt: 1 });

module.exports = mongoose.models.RequestStatusHistory || mongoose.model(
  "RequestStatusHistory",
  requestStatusHistorySchema
);
