import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Search, Users, ArrowLeft,
    Menu, X, Wifi, WifiOff, Volume2, VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

import ChatSidebar from '../components/chat/ChatSidebar';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import NewDMModal from '../components/chat/NewDMModal';

import { useChatSocket } from '../hooks/useChatSocket';
import { chatApi, type ChatRoom, type ChatMessage, type Participant } from '../services/api';

export default function ChatPage() {
    const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
    const navigate = useNavigate();

    // User state - stored in localStorage
    const [userCode, setUserCode] = useState<string>(() =>
        localStorage.getItem('userCode') || ''
    );
    const [userName, setUserName] = useState<string>(() =>
        localStorage.getItem('userName') || ''
    );

    // Chat state
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ userCode: string; userName: string }[]>([]);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showNewDM, setShowNewDM] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageSound = useRef<HTMLAudioElement | null>(null);

    // Initialize sound
    useEffect(() => {
        messageSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVoYWa3U1nJGDBlhn8jlqXdFLlyEst/WdjYSOrTL25U7');
    }, []);

    // WebSocket hook
    const {
        isConnected,
        joinRoom,
        sendMessage,
        sendTyping,
        sendReaction,
        markAsRead,
    } = useChatSocket({
        userCode,
        userName,
        onMessage: useCallback((message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
            // Play sound for messages from others
            if (message.senderCode !== userCode && soundEnabled && messageSound.current) {
                messageSound.current.play().catch(() => { });
            }
        }, [userCode, soundEnabled]),
        onTypingUpdate: useCallback((users) => {
            setTypingUsers(users.filter(u => u.userCode !== userCode));
        }, [userCode]),
        onReadReceipt: useCallback((readerCode) => {
            setMessages((prev) => prev.map((msg) => {
                if (!msg.readBy.includes(readerCode)) {
                    return { ...msg, readBy: [...msg.readBy, readerCode] };
                }
                return msg;
            }));
        }, []),
        onReactionUpdate: useCallback((messageId, reactions) => {
            setMessages((prev) => prev.map((msg) =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        }, []),
    });

    // Check if user is logged in
    useEffect(() => {
        if (!userCode) {
            setShowLogin(true);
            setIsLoading(false);
        }
    }, [userCode]);

    // Load rooms
    useEffect(() => {
        if (!userCode) return;

        const loadRooms = async () => {
            try {
                const response = await chatApi.getRooms(userCode);
                setRooms(response.data);

                // Load participants for DM suggestions
                const participantsResponse = await chatApi.getParticipants(userCode);
                setParticipants(participantsResponse.data);

                // Select room from URL or default to global
                if (urlRoomId) {
                    const room = response.data.find(r => r.roomId === urlRoomId);
                    if (room) {
                        setActiveRoom(room);
                    }
                } else if (response.data.length > 0) {
                    // Default to global room
                    const globalRoom = response.data.find(r => r.roomType === 'global');
                    if (globalRoom) {
                        setActiveRoom(globalRoom);
                        navigate(`/chat/${encodeURIComponent(globalRoom.roomId)}`, { replace: true });
                    }
                }
            } catch (error) {
                console.error('Failed to load rooms:', error);
                toast.error('Failed to load chat rooms');
            } finally {
                setIsLoading(false);
            }
        };

        loadRooms();
    }, [userCode, urlRoomId, navigate]);

    // Load messages when room changes
    useEffect(() => {
        if (!activeRoom || !userCode) return;

        const loadMessages = async () => {
            try {
                const response = await chatApi.getMessages(activeRoom.roomId);
                setMessages(response.data.messages);
                joinRoom(activeRoom.roomId);
                markAsRead(activeRoom.roomId);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();
        setTypingUsers([]);
    }, [activeRoom, userCode, joinRoom, markAsRead]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle room selection
    const handleRoomSelect = (room: ChatRoom) => {
        setActiveRoom(room);
        navigate(`/chat/${encodeURIComponent(room.roomId)}`);
        setIsSidebarOpen(false);
    };

    // Handle new DM
    const handleNewDM = async (participant: Participant) => {
        try {
            const response = await chatApi.createDMRoom(userCode, participant.individualCode);
            const dmRoom = response.data;

            // Add to rooms if not already there
            setRooms((prev) => {
                if (!prev.find(r => r.roomId === dmRoom.roomId)) {
                    return [...prev, dmRoom];
                }
                return prev;
            });

            setActiveRoom(dmRoom);
            navigate(`/chat/${encodeURIComponent(dmRoom.roomId)}`);
            setShowNewDM(false);
        } catch (error) {
            console.error('Failed to create DM:', error);
            toast.error('Failed to start conversation');
        }
    };

    // Handle send message
    const handleSendMessage = (content: string) => {
        if (activeRoom) {
            sendMessage(activeRoom.roomId, content);
        }
    };

    // Handle reaction
    const handleReaction = (messageId: string, emoji: string) => {
        sendReaction(messageId, emoji);
    };

    // Handle delete
    const handleDeleteMessage = async (messageId: string) => {
        try {
            await chatApi.deleteMessage(messageId, userCode);
            setMessages((prev) => prev.map((msg) =>
                msg._id === messageId ? { ...msg, isDeleted: true, content: 'This message was deleted' } : msg
            ));
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    // Login form
    const handleLogin = (code: string, name: string) => {
        localStorage.setItem('userCode', code.toUpperCase());
        localStorage.setItem('userName', name);
        setUserCode(code.toUpperCase());
        setUserName(name);
        setShowLogin(false);
        setIsLoading(true);
    };

    // Login Modal
    if (showLogin) {
        return <LoginModal onLogin={handleLogin} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full 
                        animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 uppercase tracking-wider text-sm">Loading Chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : '-100%',
                }}
                className={`fixed lg:relative z-50 lg:z-auto h-full w-80 flex-shrink-0 
          ${isSidebarOpen ? '' : 'lg:flex hidden'}`}
            >
                <ChatSidebar
                    rooms={rooms}
                    activeRoomId={activeRoom?.roomId || null}
                    userCode={userCode}
                    onRoomSelect={handleRoomSelect}
                    onNewDM={() => setShowNewDM(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-[#1A1A1A] bg-[#0A0A0A]">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 hover:bg-[#1A1A1A] rounded"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {activeRoom ? (
                            <>
                                <div className={`w-10 h-10 rounded flex items-center justify-center
                  ${activeRoom.roomType === 'global' ? 'bg-[#FF6B35]/20' :
                                        activeRoom.roomType === 'group' ? 'bg-cyan-400/20' : 'bg-purple-400/20'}`}
                                >
                                    {activeRoom.roomType === 'global' ? '🌐' :
                                        activeRoom.roomType === 'group' ? '👥' : '💬'}
                                </div>
                                <div>
                                    <h1 className="font-bold text-white">
                                        {activeRoom.otherParticipant?.name || activeRoom.name}
                                    </h1>
                                    <p className="text-xs text-gray-500">
                                        {activeRoom.roomType === 'global' ? 'Everyone is here!' :
                                            activeRoom.roomType === 'group' ? `${activeRoom.participants.length} members` :
                                                'Direct Message'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                                <MessageCircle className="w-5 h-5" />
                                <span>Select a chat to start messaging</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Connection Status */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs
              ${isConnected ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
                        </div>

                        {/* Sound Toggle */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded transition-colors
                ${soundEnabled ? 'text-[#FF6B35]' : 'text-gray-500'}`}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeRoom ? (
                        <>
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-[#1A1A1A] rounded-full 
                                flex items-center justify-center text-4xl">
                                        {activeRoom.roomType === 'global' ? '🌍' :
                                            activeRoom.roomType === 'group' ? '🏃' : '👋'}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        {activeRoom.roomType === 'global' ? 'Welcome to the Global Lounge!' :
                                            activeRoom.roomType === 'group' ? 'Squad Chat Ready!' :
                                                'Start your conversation!'}
                                    </h3>
                                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                                        {activeRoom.roomType === 'global'
                                            ? 'This is where all FIT-O-CHARITY participants come together. Say hello!'
                                            : activeRoom.roomType === 'group'
                                                ? 'Motivate your squad members and celebrate your achievements together!'
                                                : 'Send a message to start chatting with this person.'}
                                    </p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {messages.map((message) => (
                                        <MessageBubble
                                            key={message._id}
                                            message={message}
                                            isOwnMessage={message.senderCode === userCode}
                                            userCode={userCode}
                                            onReaction={handleReaction}
                                            onDelete={handleDeleteMessage}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}

                            <TypingIndicator typingUsers={typingUsers} />
                            <div ref={messagesEndRef} />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500">Select a chat from the sidebar</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {activeRoom && (
                    <ChatInput
                        onSend={handleSendMessage}
                        onTyping={() => sendTyping(activeRoom.roomId)}
                        participants={participants}
                        disabled={!isConnected}
                        placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                    />
                )}
            </div>

            {/* New DM Modal */}
            <NewDMModal
                isOpen={showNewDM}
                onClose={() => setShowNewDM(false)}
                participants={participants}
                onSelectParticipant={handleNewDM}
            />
        </div>
    );
}

// Login Modal Component
function LoginModal({ onLogin }: { onLogin: (code: string, name: string) => void }) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length === 6 && name.trim()) {
            onLogin(code, name);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0D0D0D] border-2 border-[#1A1A1A] p-8 max-w-md w-full"
                style={{ boxShadow: '20px 20px 0px 0px rgba(255, 107, 53, 0.1)' }}
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A] 
                        flex items-center justify-center text-4xl rounded">
                        💬
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-[#FF6B35]">
                        Join Chat
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">Enter your participant code to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                            Your Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                            placeholder="ABC123"
                            maxLength={6}
                            className="w-full bg-[#0A0A0A] border-2 border-[#1A1A1A] px-4 py-3 text-center
                       text-2xl font-mono uppercase tracking-widest
                       focus:border-[#FF6B35] focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name..."
                            className="w-full bg-[#0A0A0A] border-2 border-[#1A1A1A] px-4 py-3
                       focus:border-[#FF6B35] focus:outline-none transition-colors"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={code.length !== 6 || !name.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full btn-safety py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🚀 ENTER CHAT
                    </motion.button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Use your 6-character participant code from registration
                </p>
            </motion.div>
        </div>
    );
}
