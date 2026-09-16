const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.Mixed,
      ref: "FoodRequest",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      required: true,
    },

    senderName: {
      type: String
    },

    senderRole: {
      type: String
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ request: 1, createdAt: 1 });

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
