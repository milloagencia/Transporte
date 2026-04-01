import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  _id: string;
  rater: mongoose.Types.ObjectId; // User who gives the rating
  rated: mongoose.Types.ObjectId; // User who receives the rating
  trip: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  review: string;
  categories: {
    punctuality?: number;
    communication?: number;
    vehicleCondition?: number;
    safety?: number;
    courtesy?: number;
    cargoHandling?: number; // For cargo-related trips
  };
  type: 'driver_to_passenger' | 'passenger_to_driver' | 'business_to_driver' | 'driver_to_business';
  isVerified: boolean;
  reportedAt?: Date;
  reportReason?: string;
  createdAt: Date;
}

const ratingSchema = new Schema<IRating>({
  rater: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 500
  },
  categories: {
    punctuality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    vehicleCondition: { type: Number, min: 1, max: 5 },
    safety: { type: Number, min: 1, max: 5 },
    courtesy: { type: Number, min: 1, max: 5 },
    cargoHandling: { type: Number, min: 1, max: 5 }
  },
  type: {
    type: String,
    enum: ['driver_to_passenger', 'passenger_to_driver', 'business_to_driver', 'driver_to_business'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  reportedAt: Date,
  reportReason: String
}, {
  timestamps: true
});

// Prevent duplicate ratings for the same trip and user combination
ratingSchema.index({ rater: 1, rated: 1, trip: 1 }, { unique: true });
ratingSchema.index({ rated: 1, createdAt: -1 });
ratingSchema.index({ trip: 1 });

export default mongoose.model<IRating>('Rating', ratingSchema);