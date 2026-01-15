import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant extends Document {
  name: string;
  email: string;
  mobile: string;
  activityType: 'Walking' | 'Running' | 'Cycling' | 'Yoga' | 'Gym' | 'Other';
  individualCode: string;
  groupCode?: string;
  isActive: boolean;
  totalDistance: number;
  totalDuration: number;
  totalPoints: number;
  streakDays: number;
  lastActivityDate?: Date;
  stravaId?: string;
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  stravaTokenExpiry?: number;
  badges: { id: string; unlockedAt: Date }[];
  profilePicture?: string;
  createdAt: Date;
}

const participantSchema = new Schema<IParticipant>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  activityType: { 
    type: String, 
    required: true, 
    enum: ['Walking', 'Running', 'Cycling', 'Yoga', 'Gym', 'Other'] 
  },
  individualCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  groupCode: { type: String, default: null, uppercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  totalDistance: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: null },
  stravaId: { type: String, default: null },
  stravaAccessToken: { type: String, default: null },
  stravaRefreshToken: { type: String, default: null },
  stravaTokenExpiry: { type: Number, default: null },
  badges: [{
    id: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  profilePicture: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
participantSchema.index({ groupCode: 1 });

export default mongoose.model<IParticipant>('Participant', participantSchema);