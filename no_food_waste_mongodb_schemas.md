# No Food Waste — MongoDB Schemas

These Mongoose schemas are based on the project's technical requirements.

## 1. User Schema

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["DONOR", "VOLUNTEER", "ADMIN"],
      required: true,
    },
    phone: { type: String },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

## 2. Region Schema

```js
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

module.exports = mongoose.model("Region", regionSchema);
```

## 3. FoodRequest Schema

```js
const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("FoodRequest", foodRequestSchema);
```

## 4. DeliveryProof Schema

```js
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
```

## 5. VolunteerLocation Schema

```js
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

module.exports = mongoose.model(
  "VolunteerLocation",
  volunteerLocationSchema
);
```

## 6. Message Schema

```js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodRequest",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

module.exports = mongoose.model("Message", messageSchema);
```

## 7. Notification Schema

```js
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
```

## 8. RejectionLog Schema

```js
const mongoose = require("mongoose");

const rejectionLogSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodRequest",
      required: true,
    },

    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("RejectionLog", rejectionLogSchema);
```

## 9. RequestStatusHistory Schema

```js
const mongoose = require("mongoose");

const requestStatusHistorySchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodRequest",
      required: true,
    },

    oldStatus: {
      type: String,
      required: true,
    },

    newStatus: {
      type: String,
      required: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

requestStatusHistorySchema.index({ request: 1, createdAt: 1 });

module.exports = mongoose.model(
  "RequestStatusHistory",
  requestStatusHistorySchema
);
```

## Collections

- users
- regions
- foodrequests
- deliveryproofs
- volunteerl­ocations
- messages
- notifications
- rejectionlogs
- requeststatushistories

## Important MongoDB conventions

- GeoJSON coordinates use `[longitude, latitude]`.
- Use `2dsphere` indexes for location queries.
- Images should be stored in external object/file storage; MongoDB stores their URLs/references and metadata.
- `VolunteerLocation` uses one current-location document per volunteer for the simple implementation.
