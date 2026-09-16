const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User / Donor name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['DONOR', 'VOLUNTEER', 'ADMIN'],
      default: 'DONOR'
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    lat: {
      type: Number,
      default: 13.0418
    },
    lng: {
      type: Number,
      default: 80.2341
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash password before saving if modified and not already hashed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password && this.password.startsWith('$2')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed or existing plain password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  if (this.password.startsWith('$2')) {
    return bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.password;
};

userSchema.methods.matchPassword = userSchema.methods.comparePassword;

module.exports = mongoose.models.User || mongoose.model('User', userSchema, 'users');
