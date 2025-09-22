const mongoose = require('mongoose');

const transportListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['passenger', 'cargo']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  schedule: {
    departureDate: {
      type: Date,
      required: true
    },
    departureTime: {
      type: String,
      required: true
    },
    arrivalDate: Date,
    arrivalTime: String,
    recurring: {
      type: Boolean,
      default: false
    },
    recurringDays: [String] // ['monday', 'tuesday', etc.]
  },
  capacity: {
    total: {
      type: Number,
      required: true
    },
    available: {
      type: Number,
      required: true
    }
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'CUP'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  // For cargo shipments
  cargoDetails: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    fragile: Boolean,
    hazardous: Boolean,
    description: String
  },
  // For passenger transport
  amenities: [String], // ['AC', 'WiFi', 'USB charging', etc.]
  vehicleType: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'suspended'],
    default: 'active'
  },
  requirements: {
    type: String
  },
  contactPreferences: {
    whatsapp: Boolean,
    sms: Boolean,
    phone: Boolean,
    chat: Boolean
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
transportListingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TransportListing', transportListingSchema);