const mongoose = require("mongoose");

const rejectionLogSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.Mixed,
      ref: "FoodRequest",
      required: true,
    },

    volunteer: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.RejectionLog || mongoose.model("RejectionLog", rejectionLogSchema);
