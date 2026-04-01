import mongoose, { Document, Schema } from 'mongoose';

export interface IIncident extends Document {
  _id: string;
  reporter: mongoose.Types.ObjectId;
  reported: mongoose.Types.ObjectId;
  trip?: mongoose.Types.ObjectId;
  type: 'safety' | 'fraud' | 'harassment' | 'vehicle_issue' | 'no_show' | 'payment_issue' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence?: {
    photos?: string[];
    documents?: string[];
    witnesses?: mongoose.Types.ObjectId[];
  };
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  resolution?: {
    action: 'warning' | 'suspension' | 'blacklist' | 'no_action';
    duration?: number; // in days
    reason: string;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
  };
  createdAt: Date;
}

const incidentSchema = new Schema<IIncident>({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reported: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: Schema.Types.ObjectId,
    ref: 'Trip'
  },
  type: {
    type: String,
    enum: ['safety', 'fraud', 'harassment', 'vehicle_issue', 'no_show', 'payment_issue', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  evidence: {
    photos: [String],
    documents: [String],
    witnesses: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'dismissed'],
    default: 'open'
  },
  adminNotes: {
    type: String,
    maxlength: 500
  },
  resolution: {
    action: {
      type: String,
      enum: ['warning', 'suspension', 'blacklist', 'no_action']
    },
    duration: Number,
    reason: String,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
incidentSchema.index({ reporter: 1 });
incidentSchema.index({ reported: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ createdAt: -1 });

export default mongoose.model<IIncident>('Incident', incidentSchema);