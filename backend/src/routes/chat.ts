import express, { Request, Response, Router } from 'express';
import Message from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import Participant from '../models/Participant.js';
import Group from '../models/Group.js';

const router: Router = express.Router();

// Get all rooms for a user
router.get('/rooms/:userCode', async (req: Request, res: Response) => {
    try {
        const { userCode } = req.params;
        const user = await Participant.findOne({ individualCode: userCode.toUpperCase() });

        if (!user) {
            return res.status(404).json({ error: 'Participant not found' });
        }

        // Get or create global room
        const globalRoom = await (ChatRoom as any).getGlobalRoom();

        // Add user to global participants if not already
        if (!globalRoom.participants.includes(userCode.toUpperCase())) {
            globalRoom.participants.push(userCode.toUpperCase());
            await globalRoom.save();
        }

        // Get group room if user belongs to a group
        let groupRooms: any[] = [];
        if (user.groupCode) {
            const group = await Group.findOne({ groupCode: user.groupCode });
            if (group) {
                const groupRoom = await (ChatRoom as any).getGroupRoom(group.groupCode, group.groupName);
                if (!groupRoom.participants.includes(userCode.toUpperCase())) {
                    groupRoom.participants.push(userCode.toUpperCase());
                    await groupRoom.save();
                }
                groupRooms.push(groupRoom);
            }
        }

        // Get all DM rooms for this user
        const dmRooms = await ChatRoom.find({
            roomType: 'direct',
            participants: userCode.toUpperCase()
        }).sort({ 'lastMessage.createdAt': -1 });

        // Enhance DM rooms with other participant info
        const enhancedDMRooms = await Promise.all(dmRooms.map(async (room) => {
            const otherCode = room.participants.find(p => p !== userCode.toUpperCase());
            if (otherCode) {
                const otherUser = await Participant.findOne({ individualCode: otherCode });
                if (otherUser) {
                    return {
                        ...room.toObject(),
                        name: otherUser.name,
                        avatar: otherUser.profilePicture,
                        otherParticipant: {
                            code: otherUser.individualCode,
                            name: otherUser.name,
                            avatar: otherUser.profilePicture
                        }
                    };
                }
            }
            return room.toObject();
        }));

        const allRooms = [globalRoom.toObject(), ...groupRooms.map(r => r.toObject()), ...enhancedDMRooms];

        res.json(allRooms);
    } catch (error) {
        console.error('❌ Error fetching chat rooms:', error);
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
});

// Get messages for a room (paginated)
router.get('/messages/:roomId', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            roomId,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({ roomId, isDeleted: false });

        res.json({
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Search messages in a room
router.get('/messages/:roomId/search', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const messages = await Message.find({
            roomId,
            isDeleted: false,
            content: { $regex: query, $options: 'i' }
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(messages);
    } catch (error) {
        console.error('❌ Error searching messages:', error);
        res.status(500).json({ error: 'Failed to search messages' });
    }
});

// Create or get DM room
router.post('/rooms/direct', async (req: Request, res: Response) => {
    try {
        const { userCode1, userCode2 } = req.body;

        if (!userCode1 || !userCode2) {
            return res.status(400).json({ error: 'Both user codes are required' });
        }

        const user1 = await Participant.findOne({ individualCode: userCode1.toUpperCase() });
        const user2 = await Participant.findOne({ individualCode: userCode2.toUpperCase() });

        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both participants not found' });
        }

        const dmRoom = await (ChatRoom as any).getDMRoom(
            userCode1,
            userCode2,
            user1.name,
            user2.name
        );

        res.json(dmRoom);
    } catch (error) {
        console.error('❌ Error creating DM room:', error);
        res.status(500).json({ error: 'Failed to create DM room' });
    }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const { emoji, userCode } = req.body;

        if (!emoji || !userCode) {
            return res.status(400).json({ error: 'Emoji and user code are required' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Find existing reaction or create new one
        const existingReaction = message.reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
            // Toggle user in reaction
            const userIndex = existingReaction.userCodes.indexOf(userCode.toUpperCase());
            if (userIndex > -1) {
                existingReaction.userCodes.splice(userIndex, 1);
                // Remove reaction if no users left
                if (existingReaction.userCodes.length === 0) {
                    message.reactions = message.reactions.filter(r => r.emoji !== emoji);
                }
            } else {
                existingReaction.userCodes.push(userCode.toUpperCase());
            }
        } else {
            message.reactions.push({
                emoji,
                userCodes: [userCode.toUpperCase()]
            });
        }

        await message.save();
        res.json(message);
    } catch (error) {
        console.error('❌ Error adding reaction:', error);
        res.status(500).json({ error: 'Failed to add reaction' });
    }
});

// Mark messages as read
router.put('/messages/:roomId/read', async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const { userCode } = req.body;

        if (!userCode) {
            return res.status(400).json({ error: 'User code is required' });
        }

        // Update all unread messages in the room
        await Message.updateMany(
            {
                roomId,
                senderCode: { $ne: userCode.toUpperCase() },
                readBy: { $ne: userCode.toUpperCase() }
            },
            { $addToSet: { readBy: userCode.toUpperCase() } }
        );

        // Reset unread count for user in room
        const room = await ChatRoom.findOne({ roomId });
        if (room) {
            room.unreadCounts.set(userCode.toUpperCase(), 0);
            await room.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

// Soft delete message
router.delete('/messages/:messageId', async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const { userCode } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only sender can delete their message
        if (message.senderCode !== userCode?.toUpperCase()) {
            return res.status(403).json({ error: 'Only the sender can delete this message' });
        }

        message.isDeleted = true;
        message.content = 'This message was deleted';
        await message.save();

        res.json({ success: true, message });
    } catch (error) {
        console.error('❌ Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Get all participants for DM suggestions
router.get('/participants/:userCode', async (req: Request, res: Response) => {
    try {
        const { userCode } = req.params;

        const participants = await Participant.find({
            individualCode: { $ne: userCode.toUpperCase() },
            isActive: true
        })
            .select('name individualCode profilePicture groupCode')
            .sort({ name: 1 });

        res.json(participants);
    } catch (error) {
        console.error('❌ Error fetching participants:', error);
        res.status(500).json({ error: 'Failed to fetch participants' });
    }
});

export default router;
