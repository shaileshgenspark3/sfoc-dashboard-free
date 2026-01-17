import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage } from '../services/api';

interface TypingUser {
    userCode: string;
    userName: string;
}

interface UseChatSocketOptions {
    userCode: string;
    userName: string;
    userAvatar?: string;
    onMessage?: (message: ChatMessage) => void;
    onTypingUpdate?: (typingUsers: TypingUser[]) => void;
    onReadReceipt?: (userCode: string) => void;
    onReactionUpdate?: (messageId: string, reactions: ChatMessage['reactions']) => void;
    onUserJoined?: (userCode: string, userName: string) => void;
}

export function useChatSocket({
    userCode,
    userName,
    userAvatar,
    onMessage,
    onTypingUpdate,
    onReadReceipt,
    onReactionUpdate,
    onUserJoined,
}: UseChatSocketOptions) {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}`;

        ws.current = new WebSocket(host);

        ws.current.onopen = () => {
            console.log('💬 Chat WebSocket connected');
            setIsConnected(true);
            reconnectAttempts.current = 0;

            // Authenticate
            ws.current?.send(JSON.stringify({
                type: 'chat_auth',
                userCode,
                userName,
                userAvatar,
            }));
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'chat_new_message':
                        onMessage?.(data.message);
                        break;
                    case 'chat_typing_update':
                        if (data.roomId === currentRoom) {
                            onTypingUpdate?.(data.typingUsers);
                        }
                        break;
                    case 'chat_read_receipt':
                        if (data.roomId === currentRoom) {
                            onReadReceipt?.(data.userCode);
                        }
                        break;
                    case 'chat_reaction_update':
                        onReactionUpdate?.(data.messageId, data.reactions);
                        break;
                    case 'chat_user_joined':
                        onUserJoined?.(data.userCode, data.userName);
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onclose = () => {
            console.log('💬 Chat WebSocket disconnected');
            setIsConnected(false);

            // Attempt reconnection
            if (reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current++;
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                setTimeout(connect, delay);
            }
        };

        ws.current.onerror = (error) => {
            console.error('💬 Chat WebSocket error:', error);
        };
    }, [userCode, userName, userAvatar, currentRoom, onMessage, onTypingUpdate, onReadReceipt, onReactionUpdate, onUserJoined]);

    useEffect(() => {
        if (userCode) {
            connect();
        }

        return () => {
            ws.current?.close();
        };
    }, [userCode, connect]);

    const joinRoom = useCallback((roomId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            // Leave previous room
            if (currentRoom) {
                ws.current.send(JSON.stringify({
                    type: 'chat_leave',
                    roomId: currentRoom,
                }));
            }

            // Join new room
            ws.current.send(JSON.stringify({
                type: 'chat_join',
                roomId,
            }));
            setCurrentRoom(roomId);
        }
    }, [currentRoom]);

    const sendMessage = useCallback((roomId: string, content: string) => {
        if (ws.current?.readyState === WebSocket.OPEN && content.trim()) {
            ws.current.send(JSON.stringify({
                type: 'chat_message',
                roomId,
                content: content.trim(),
            }));
        }
    }, []);

    const sendTyping = useCallback((roomId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'chat_typing',
                roomId,
            }));

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Auto-stop typing after 2 seconds of no input
            typingTimeoutRef.current = setTimeout(() => {
                ws.current?.send(JSON.stringify({
                    type: 'chat_stop_typing',
                    roomId,
                }));
            }, 2000);
        }
    }, []);

    const sendReaction = useCallback((messageId: string, emoji: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'chat_reaction',
                messageId,
                emoji,
            }));
        }
    }, []);

    const markAsRead = useCallback((roomId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'chat_read',
                roomId,
            }));
        }
    }, []);

    return {
        isConnected,
        currentRoom,
        joinRoom,
        sendMessage,
        sendTyping,
        sendReaction,
        markAsRead,
    };
}
