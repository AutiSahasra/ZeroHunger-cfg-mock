const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    }
  },
  { _id: true }
);

const deliveryProofSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: true
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deliveryLocation: {
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },
    deliverySpotImages: [imageSchema],
    foodImages: [imageSchema],
    volunteerNotes: {
      type: String,
      default: ''
    },
    beneficiariesFed: {
      type: Number,
      default: null
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.DeliveryProof || mongoose.model('DeliveryProof', deliveryProofSchema, 'deliveryproofs');
