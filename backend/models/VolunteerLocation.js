const mongoose = require("mongoose");

const volunteerLocationSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    location: {
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

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

volunteerLocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.models.VolunteerLocation || mongoose.model(
  "VolunteerLocation",
  volunteerLocationSchema
);
