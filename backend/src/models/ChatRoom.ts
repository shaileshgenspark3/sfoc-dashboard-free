import mongoose, { Document, Schema } from 'mongoose';

export interface ILastMessage {
    content: string;
    senderName: string;
    senderCode: string;
    createdAt: Date;
}

export interface IChatRoom extends Document {
    roomId: string;
    roomType: 'global' | 'group' | 'direct';
    participants: string[];
    name: string;
    description?: string;
    avatar?: string;
    lastMessage?: ILastMessage;
    unreadCounts: Map<string, number>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['global', 'group', 'direct']
    },
    participants: [{
        type: String,
        uppercase: true,
        trim: true
    }],
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    lastMessage: {
        content: String,
        senderName: String,
        senderCode: String,
        createdAt: Date
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: new Map()
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for finding user's rooms
chatRoomSchema.index({ participants: 1 });

// Static method to get or create global room
chatRoomSchema.statics.getGlobalRoom = async function () {
    let globalRoom = await this.findOne({ roomId: 'global' });
    if (!globalRoom) {
        globalRoom = await this.create({
            roomId: 'global',
            roomType: 'global',
            participants: [],
            name: '🌐 Global Lounge',
            description: 'Welcome to the FIT-O-CHARITY community! Chat with everyone here.'
        });
    }
    return globalRoom;
};

// Static method to get or create group room
chatRoomSchema.statics.getGroupRoom = async function (groupCode: string, groupName: string) {
    let groupRoom = await this.findOne({ roomId: `group_${groupCode}` });
    if (!groupRoom) {
        groupRoom = await this.create({
            roomId: `group_${groupCode}`,
            roomType: 'group',
            participants: [],
            name: `👥 ${groupName}`,
            description: `Squad chat for ${groupName}`
        });
    }
    return groupRoom;
};

// Static method to get or create DM room
chatRoomSchema.statics.getDMRoom = async function (
    userCode1: string,
    userCode2: string,
    userName1: string,
    userName2: string
) {
    // Create consistent room ID (alphabetically sorted)
    const sortedCodes = [userCode1.toUpperCase(), userCode2.toUpperCase()].sort();
    const roomId = `dm_${sortedCodes[0]}_${sortedCodes[1]}`;

    let dmRoom = await this.findOne({ roomId });
    if (!dmRoom) {
        dmRoom = await this.create({
            roomId,
            roomType: 'direct',
            participants: sortedCodes,
            name: `${userName1} & ${userName2}`,
            description: 'Direct message'
        });
    }
    return dmRoom;
};

export default mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema);
