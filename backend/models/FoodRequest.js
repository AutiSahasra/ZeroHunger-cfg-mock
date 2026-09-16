const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      required: true,
    },

    assignedVolunteer: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      default: null,
    },

    foodDetails: {
      foodType: { type: String, required: true },
      description: { type: String },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    pickupLocation: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },

    region: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Region",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "IN_PROGRESS",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

foodRequestSchema.index({
  "pickupLocation.coordinates": "2dsphere",
});

foodRequestSchema.index({
  region: 1,
  status: 1,
  priority: -1,
});

module.exports = mongoose.models.FoodRequest || mongoose.model("FoodRequest", foodRequestSchema);
