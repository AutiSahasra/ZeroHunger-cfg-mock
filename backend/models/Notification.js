const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "REQUEST_CREATED",
        "REQUEST_ACCEPTED",
        "REQUEST_REJECTED",
        "REQUEST_IN_PROGRESS",
        "REQUEST_DELIVERED",
        "REQUEST_CANCELLED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodRequest",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Notification", notificationSchema);
