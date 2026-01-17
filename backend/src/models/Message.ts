import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction {
    emoji: string;
    userCodes: string[];
}

export interface IMessage extends Document {
    roomId: string;
    roomType: 'global' | 'group' | 'direct';
    senderCode: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    mentions: string[];
    reactions: IReaction[];
    readBy: string[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['global', 'group', 'direct']
    },
    senderCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true
    },
    senderName: {
        type: String,
        required: true,
        trim: true
    },
    senderAvatar: {
        type: String,
        default: null
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    mentions: [{
        type: String,
        uppercase: true,
        trim: true
    }],
    reactions: [{
        emoji: { type: String, required: true },
        userCodes: [{ type: String, uppercase: true, trim: true }]
    }],
    readBy: [{
        type: String,
        uppercase: true,
        trim: true
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for efficient room message queries
messageSchema.index({ roomId: 1, createdAt: -1 });
// Index for message search
messageSchema.index({ content: 'text' });

export default mongoose.model<IMessage>('Message', messageSchema);
