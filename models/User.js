const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'chofer', 'pasajero', 'negocio_cargas', 'negocio_transporte'],
    default: 'pasajero'
  },
  verified: {
    type: Boolean,
    default: false
  },
  blacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: {
    type: String
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  profileImage: {
    type: String
  },
  address: {
    street: String,
    city: String,
    province: String,
    country: {
      type: String,
      default: 'Cuba'
    }
  },
  // Additional fields for drivers
  licenseNumber: {
    type: String
  },
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    plateNumber: String,
    capacity: Number,
    type: {
      type: String,
      enum: ['passenger', 'cargo', 'both']
    }
  },
  // Additional fields for businesses
  businessInfo: {
    name: String,
    description: String,
    registrationNumber: String,
    services: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);