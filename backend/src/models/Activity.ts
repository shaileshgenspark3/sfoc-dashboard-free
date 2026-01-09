import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  participantCode: string;
  participantName: string;
  activityType: string;
  distance: number;
  duration: number;
  points: number;
  groupCode?: string;
  date: Date;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  participantCode: { type: String, required: true, uppercase: true },
  participantName: { type: String, required: true },
  activityType: { type: String, required: true },
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  groupCode: { type: String, uppercase: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

activitySchema.index({ participantCode: 1 });
activitySchema.index({ createdAt: -1 });

export default mongoose.model<IActivity>('Activity', activitySchema);