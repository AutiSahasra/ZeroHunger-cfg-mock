const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] in GeoJSON format
      required: true
    }
  },
  { _id: false }
);

const foodRequestSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor ID is required']
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    foodDetails: {
      foodType: {
        type: String,
        required: [true, 'Food type or title is required'],
        trim: true
      },
      description: {
        type: String,
        default: '',
        trim: true
      },
      category: {
        type: String,
        default: 'Cooked Hot Meals'
      },
      dietary: {
        type: String,
        default: 'Vegetarian'
      },
      instructions: {
        type: String,
        default: ''
      },
      photoUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60'
      },
      cookedTime: {
        type: String,
        default: 'Freshly prepared'
      },
      goldenHourExpiresInHours: {
        type: Number,
        default: 3.0
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity (servings / meals count) is required'],
      min: [1, 'Quantity must be at least 1']
    },
    quantityKg: {
      type: Number,
      default: function () {
        return Math.max(1, Math.round((this.quantity || 1) * 0.4));
      }
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup street address is required']
      },
      coordinates: {
        type: pointSchema,
        required: true
      }
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    },
    priority: {
      type: Number,
      default: 50
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual properties for easy frontend and backward compatibility
foodRequestSchema.virtual('donorId').get(function () {
  return this.donor?._id || this.donor;
});

foodRequestSchema.virtual('title').get(function () {
  return this.foodDetails?.foodType || '';
});

foodRequestSchema.virtual('servings').get(function () {
  return this.quantity;
});

foodRequestSchema.virtual('pickupLat').get(function () {
  const coords = this.pickupLocation?.coordinates?.coordinates;
  return Array.isArray(coords) ? coords[1] : undefined;
});

foodRequestSchema.virtual('pickupLng').get(function () {
  const coords = this.pickupLocation?.coordinates?.coordinates;
  return Array.isArray(coords) ? coords[0] : undefined;
});

foodRequestSchema.virtual('pickupAddress').get(function () {
  return this.pickupLocation?.address || '';
});

// Index for geospatial queries
foodRequestSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
foodRequestSchema.index({ donor: 1, status: 1 });

module.exports = mongoose.models.FoodRequest || mongoose.model('FoodRequest', foodRequestSchema, 'foodrequests');
