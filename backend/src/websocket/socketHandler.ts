import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import Message from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import Participant from '../models/Participant.js';

interface ExtendedWebSocket extends WebSocket {
  groupCode?: string;
  userCode?: string;
  userName?: string;
  userAvatar?: string;
  subscribedRooms: Set<string>;
}

interface ChatMessage {
  type: string;
  roomId?: string;
  content?: string;
  userCode?: string;
  userName?: string;
  userAvatar?: string;
  messageId?: string;
  emoji?: string;
  [key: string]: any;
}

let wss: WebSocketServer | null = null;

// Track typing users per room
const typingUsers: Map<string, Map<string, { name: string; timeout: NodeJS.Timeout }>> = new Map();

export const initWebSocket = (server: Server): void => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('🔌 New WebSocket connection established');
    ws.subscribedRooms = new Set();

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        handleMessage(ws, data);
      } catch (error) {
        console.error('❌ Invalid WebSocket message:', (error as Error).message);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      // Cleanup typing indicators
      if (ws.userCode) {
        ws.subscribedRooms.forEach(roomId => {
          removeTypingUser(roomId, ws.userCode!);
        });
      }
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection_success',
      message: 'Connected to FIT-O-CHARITY Dashboard Real-time Updates',
      timestamp: new Date().toISOString()
    }));
  });

  console.log('✅ WebSocket server initialized with Chat support');
};

export const broadcastActivity = (activity: any): void => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'new_activity',
    data: activity,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log('📡 Broadcasted new activity:', activity.participantName);
};

export const broadcastLeaderboardUpdate = (leaderboard: any): void => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'leaderboard_update',
    data: leaderboard,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log('📡 Broadcasted leaderboard update');
};

export const broadcastStatsUpdate = (stats: any): void => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'stats_update',
    data: stats,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Broadcast to a specific chat room
const broadcastToRoom = (roomId: string, message: any, excludeUserCode?: string): void => {
  if (!wss) return;

  const messageStr = JSON.stringify(message);

  wss.clients.forEach((client) => {
    const extClient = client as ExtendedWebSocket;
    if (
      extClient.readyState === WebSocket.OPEN &&
      extClient.subscribedRooms?.has(roomId) &&
      extClient.userCode !== excludeUserCode
    ) {
      extClient.send(messageStr);
    }
  });
};

// Remove typing user and broadcast update
const removeTypingUser = (roomId: string, userCode: string): void => {
  const roomTyping = typingUsers.get(roomId);
  if (roomTyping) {
    const userTyping = roomTyping.get(userCode);
    if (userTyping) {
      clearTimeout(userTyping.timeout);
      roomTyping.delete(userCode);
      broadcastTypingIndicator(roomId);
    }
  }
};

// Broadcast current typing users
const broadcastTypingIndicator = (roomId: string): void => {
  const roomTyping = typingUsers.get(roomId);
  const typingList = roomTyping
    ? Array.from(roomTyping.entries()).map(([code, data]) => ({
      userCode: code,
      userName: data.name
    }))
    : [];

  broadcastToRoom(roomId, {
    type: 'chat_typing_update',
    roomId,
    typingUsers: typingList,
    timestamp: new Date().toISOString()
  });
};

const handleMessage = async (ws: ExtendedWebSocket, data: ChatMessage): Promise<void> => {
  switch (data.type) {
    case 'subscribe_group':
      ws.groupCode = data.groupCode;
      console.log(`📡 Client subscribed to group: ${data.groupCode}`);
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;

    // ========== CHAT HANDLERS ==========

    case 'chat_auth':
      // Authenticate user for chat
      if (data.userCode) {
        ws.userCode = data.userCode.toUpperCase();
        ws.userName = data.userName;
        ws.userAvatar = data.userAvatar;
        console.log(`💬 Chat user authenticated: ${ws.userName} (${ws.userCode})`);
        ws.send(JSON.stringify({
          type: 'chat_auth_success',
          userCode: ws.userCode,
          timestamp: new Date().toISOString()
        }));
      }
      break;

    case 'chat_join':
      // Join a chat room
      if (data.roomId) {
        ws.subscribedRooms.add(data.roomId);
        console.log(`💬 User ${ws.userCode} joined room: ${data.roomId}`);

        // Notify room of user joining
        broadcastToRoom(data.roomId, {
          type: 'chat_user_joined',
          roomId: data.roomId,
          userCode: ws.userCode,
          userName: ws.userName,
          timestamp: new Date().toISOString()
        }, ws.userCode);
      }
      break;

    case 'chat_leave':
      // Leave a chat room
      if (data.roomId) {
        ws.subscribedRooms.delete(data.roomId);
        removeTypingUser(data.roomId, ws.userCode!);
        console.log(`💬 User ${ws.userCode} left room: ${data.roomId}`);
      }
      break;

    case 'chat_message':
      // Handle new chat message
      if (data.roomId && data.content && ws.userCode) {
        try {
          // Extract mentions from content
          const mentionRegex = /@([A-Z0-9]{6})/g;
          const mentions: string[] = [];
          let match;
          while ((match = mentionRegex.exec(data.content.toUpperCase())) !== null) {
            mentions.push(match[1]);
          }

          // Get room to determine type
          const room = await ChatRoom.findOne({ roomId: data.roomId });
          if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
          }

          // Save message to database
          const message = await Message.create({
            roomId: data.roomId,
            roomType: room.roomType,
            senderCode: ws.userCode,
            senderName: ws.userName,
            senderAvatar: ws.userAvatar,
            content: data.content,
            mentions,
            readBy: [ws.userCode]
          });

          // Update room's last message
          room.lastMessage = {
            content: data.content.substring(0, 100),
            senderName: ws.userName || 'Unknown',
            senderCode: ws.userCode,
            createdAt: new Date()
          };

          // Increment unread count for other participants
          room.participants.forEach(participantCode => {
            if (participantCode !== ws.userCode) {
              const currentCount = room.unreadCounts.get(participantCode) || 0;
              room.unreadCounts.set(participantCode, currentCount + 1);
            }
          });

          await room.save();

          // Broadcast message to room
          broadcastToRoom(data.roomId, {
            type: 'chat_new_message',
            roomId: data.roomId,
            message: message.toObject(),
            timestamp: new Date().toISOString()
          });

          // Remove typing indicator for sender
          removeTypingUser(data.roomId, ws.userCode);

          console.log(`💬 Message sent in ${data.roomId} by ${ws.userName}`);
        } catch (error) {
          console.error('❌ Error saving chat message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
        }
      }
      break;

    case 'chat_typing':
      // Handle typing indicator
      if (data.roomId && ws.userCode && ws.userName) {
        const roomId = data.roomId;

        if (!typingUsers.has(roomId)) {
          typingUsers.set(roomId, new Map());
        }

        const roomTyping = typingUsers.get(roomId)!;

        // Clear existing timeout
        const existing = roomTyping.get(ws.userCode);
        if (existing) {
          clearTimeout(existing.timeout);
        }

        // Set new timeout (auto-remove after 3 seconds)
        const timeout = setTimeout(() => {
          removeTypingUser(roomId, ws.userCode!);
        }, 3000);

        roomTyping.set(ws.userCode, { name: ws.userName, timeout });
        broadcastTypingIndicator(roomId);
      }
      break;

    case 'chat_stop_typing':
      if (data.roomId && ws.userCode) {
        removeTypingUser(data.roomId, ws.userCode);
      }
      break;

    case 'chat_read':
      // Mark messages as read
      if (data.roomId && ws.userCode) {
        try {
          await Message.updateMany(
            {
              roomId: data.roomId,
              senderCode: { $ne: ws.userCode },
              readBy: { $ne: ws.userCode }
            },
            { $addToSet: { readBy: ws.userCode } }
          );

          // Reset unread count
          const room = await ChatRoom.findOne({ roomId: data.roomId });
          if (room) {
            room.unreadCounts.set(ws.userCode, 0);
            await room.save();
          }

          // Broadcast read receipt
          broadcastToRoom(data.roomId, {
            type: 'chat_read_receipt',
            roomId: data.roomId,
            userCode: ws.userCode,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('❌ Error marking messages as read:', error);
        }
      }
      break;

    case 'chat_reaction':
      // Handle reaction
      if (data.messageId && data.emoji && ws.userCode) {
        try {
          const message = await Message.findById(data.messageId);
          if (message) {
            const existingReaction = message.reactions.find(r => r.emoji === data.emoji);

            if (existingReaction) {
              const userIndex = existingReaction.userCodes.indexOf(ws.userCode);
              if (userIndex > -1) {
                existingReaction.userCodes.splice(userIndex, 1);
                if (existingReaction.userCodes.length === 0) {
                  message.reactions = message.reactions.filter(r => r.emoji !== data.emoji);
                }
              } else {
                existingReaction.userCodes.push(ws.userCode);
              }
            } else {
              message.reactions.push({
                emoji: data.emoji,
                userCodes: [ws.userCode]
              });
            }

            await message.save();

            // Broadcast reaction update
            broadcastToRoom(message.roomId, {
              type: 'chat_reaction_update',
              roomId: message.roomId,
              messageId: data.messageId,
              reactions: message.reactions,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('❌ Error handling reaction:', error);
        }
      }
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
};
