const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportListing',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  passengers: {
    count: {
      type: Number,
      required: true,
      min: 1
    },
    details: [{
      name: String,
      phone: String,
      age: Number,
      id: String // Cédula de identidad
    }]
  },
  // For cargo bookings
  cargoDetails: {
    weight: Number,
    description: String,
    value: Number,
    insurance: Boolean
  },
  pickup: {
    address: String,
    date: Date,
    time: String,
    instructions: String
  },
  dropoff: {
    address: String,
    date: Date,
    time: String,
    instructions: String
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'transfer', 'crypto'],
      default: 'cash'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'CUP'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  communication: {
    preferredMethod: {
      type: String,
      enum: ['whatsapp', 'sms', 'phone', 'chat'],
      default: 'whatsapp'
    },
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['text', 'location', 'image'],
        default: 'text'
      }
    }]
  },
  notes: {
    passenger: String,
    driver: String,
    admin: String
  },
  rating: {
    passengerRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: Date
    },
    driverRating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: Date
    }
  },
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
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);