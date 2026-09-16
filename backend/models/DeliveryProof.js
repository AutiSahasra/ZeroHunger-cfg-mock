const mongoose = require("mongoose");

const deliveryProofSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodRequest",
      required: true,
      unique: true,
    },

    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deliveryLocation: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },

    foodImages: [
      {
        url: String,
        publicId: String,
      },
    ],

    deliverySpotImages: [
      {
        url: String,
        publicId: String,
      },
    ],

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

deliveryProofSchema.index({
  "deliveryLocation.coordinates": "2dsphere",
});

module.exports = mongoose.model("DeliveryProof", deliveryProofSchema);
