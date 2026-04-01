import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  _id: string;
  driver: mongoose.Types.ObjectId;
  type: 'passenger' | 'cargo' | 'mixed';
  origin: {
    address: string;
    city: string;
    province: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    address: string;
    city: string;
    province: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  departureDate: Date;
  departureTime: string;
  estimatedArrivalTime?: string;
  actualArrivalTime?: Date;
  vehicle: {
    type: 'car' | 'van' | 'bus' | 'truck' | 'motorcycle';
    model: string;
    year: number;
    licensePlate: string;
    capacity: {
      passengers?: number;
      cargoWeight?: number; // in kg
      cargoVolume?: number; // in cubic meters
    };
    features: string[]; // ['ac', 'wifi', 'gps', 'music_system', 'luggage_space']
  };
  pricing: {
    passengerPrice?: number;
    cargoPrice?: number; // per kg or per volume
    priceType?: 'fixed' | 'per_km' | 'per_kg' | 'negotiable';
    currency: 'CUP' | 'USD';
  };
  passengers: [{
    user: mongoose.Types.ObjectId;
    bookedAt: Date;
    seatNumber?: number;
    status: 'booked' | 'confirmed' | 'cancelled' | 'completed';
    pickupLocation?: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    dropoffLocation?: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    pricePaid: number;
  }];
  cargo: [{
    business: mongoose.Types.ObjectId;
    description: string;
    weight: number;
    volume?: number;
    specialRequirements?: string[];
    pickupLocation: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    deliveryLocation: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    status: 'booked' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    bookedAt: Date;
    pricePaid: number;
  }];
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  availableSeats: number;
  availableCargoSpace: {
    weight: number;
    volume?: number;
  };
  route: {
    distance: number; // in km
    estimatedDuration: number; // in minutes
    waypoints?: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      stopDuration?: number; // in minutes
    }[];
  };
  recurring: {
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    endDate?: Date;
  };
  communication: {
    allowWhatsApp: boolean;
    allowSMS: boolean;
    allowCalls: boolean;
    groupChatId?: string;
  };
  requirements: {
    minimumRating?: number;
    verificationRequired: boolean;
    specialInstructions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>({
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['passenger', 'cargo', 'mixed'],
    required: true
  },
  origin: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  destination: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  departureDate: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  estimatedArrivalTime: String,
  actualArrivalTime: Date,
  vehicle: {
    type: {
      type: String,
      enum: ['car', 'van', 'bus', 'truck', 'motorcycle'],
      required: true
    },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true },
    capacity: {
      passengers: Number,
      cargoWeight: Number,
      cargoVolume: Number
    },
    features: [String]
  },
  pricing: {
    passengerPrice: Number,
    cargoPrice: Number,
    priceType: {
      type: String,
      enum: ['fixed', 'per_km', 'per_kg', 'negotiable'],
      default: 'fixed'
    },
    currency: {
      type: String,
      enum: ['CUP', 'USD'],
      default: 'CUP'
    }
  },
  passengers: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    bookedAt: { type: Date, default: Date.now },
    seatNumber: Number,
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'cancelled', 'completed'],
      default: 'booked'
    },
    pickupLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    dropoffLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    pricePaid: Number
  }],
  cargo: [{
    business: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, required: true },
    weight: { type: Number, required: true },
    volume: Number,
    specialRequirements: [String],
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    },
    deliveryLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    },
    status: {
      type: String,
      enum: ['booked', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'booked'
    },
    bookedAt: { type: Date, default: Date.now },
    pricePaid: Number
  }],
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  },
  availableSeats: {
    type: Number,
    default: 0
  },
  availableCargoSpace: {
    weight: { type: Number, default: 0 },
    volume: { type: Number, default: 0 }
  },
  route: {
    distance: { type: Number, required: true },
    estimatedDuration: { type: Number, required: true },
    waypoints: [{
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      stopDuration: Number
    }]
  },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    daysOfWeek: [Number],
    endDate: Date
  },
  communication: {
    allowWhatsApp: { type: Boolean, default: true },
    allowSMS: { type: Boolean, default: true },
    allowCalls: { type: Boolean, default: true },
    groupChatId: String
  },
  requirements: {
    minimumRating: Number,
    verificationRequired: { type: Boolean, default: false },
    specialInstructions: String
  }
}, {
  timestamps: true
});

// Indexes for better search performance
tripSchema.index({ 'origin.city': 1, 'destination.city': 1 });
tripSchema.index({ 'origin.province': 1, 'destination.province': 1 });
tripSchema.index({ departureDate: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ type: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ 'origin.coordinates': '2dsphere' });
tripSchema.index({ 'destination.coordinates': '2dsphere' });

export default mongoose.model<ITrip>('Trip', tripSchema);