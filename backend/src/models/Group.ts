import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupMember {
  individualCode: string;
  joinedAt: Date;
}

export interface IGroup extends Document {
  groupName: string;
  groupCode: string;
  description: string;
  members: IGroupMember[];
  totalDistance: number;
  totalDuration: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

const groupSchema = new Schema<IGroup>({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  groupCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  members: [{
    individualCode: {
      type: String,
      uppercase: true,
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalDistance: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for faster queries
groupSchema.index({ groupCode: 1 });
groupSchema.index({ totalDistance: -1 });

export default mongoose.model<IGroup>('Group', groupSchema);
