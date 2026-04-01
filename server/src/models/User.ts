import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'driver' | 'passenger' | 'cargo_business' | 'transport_business';
  firstName: string;
  lastName: string;
  phone: string;
  whatsappNumber?: string;
  profileImage?: string;
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistedBy?: mongoose.Types.ObjectId;
  blacklistedAt?: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    drivingLicense?: string;
    vehicleRegistration?: string;
    businessLicense?: string;
    idCard?: string;
  };
  address: {
    street: string;
    city: string;
    province: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  rating: {
    average: number;
    totalRatings: number;
  };
  joinedAt: Date;
  lastActive: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'driver', 'passenger', 'cargo_business', 'transport_business'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: {
    type: String
  },
  blacklistedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  blacklistedAt: {
    type: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  documents: {
    drivingLicense: String,
    vehicleRegistration: String,
    businessLicense: String,
    idCard: String
  },
  address: {
    street: {
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
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for better search performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'address.province': 1 });
userSchema.index({ isBlacklisted: 1 });
userSchema.index({ verificationStatus: 1 });

export default mongoose.model<IUser>('User', userSchema);