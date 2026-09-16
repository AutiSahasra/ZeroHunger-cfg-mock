const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] in GeoJSON
      required: true
    }
  },
  { _id: false }
);

const volunteerLocationSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    location: {
      type: pointSchema,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

volunteerLocationSchema.virtual('lat').get(function () {
  return this.location?.coordinates?.[1];
});

volunteerLocationSchema.virtual('lng').get(function () {
  return this.location?.coordinates?.[0];
});

volunteerLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('VolunteerLocation', volunteerLocationSchema, 'volunteerlocations');
