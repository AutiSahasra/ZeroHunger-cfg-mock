const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },

    center: {
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

    boundary: {
      type: {
        type: String,
        enum: ["Polygon"],
      },
      coordinates: {
        type: [[[Number]]],
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

regionSchema.index({ center: "2dsphere" });

module.exports = mongoose.models.Region || mongoose.model("Region", regionSchema);
