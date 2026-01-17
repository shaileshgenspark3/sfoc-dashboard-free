import { motion } from 'framer-motion';
import { Globe, Users, MessageCircle, Search, Plus } from 'lucide-react';
import type { ChatRoom } from '../../services/api';
import { formatDistanceToNow } from '../../utils/formatters';

interface ChatSidebarProps {
    rooms: ChatRoom[];
    activeRoomId: string | null;
    userCode: string;
    onRoomSelect: (room: ChatRoom) => void;
    onNewDM: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function ChatSidebar({
    rooms,
    activeRoomId,
    userCode,
    onRoomSelect,
    onNewDM,
    searchQuery,
    onSearchChange,
}: ChatSidebarProps) {
    const getRoomIcon = (room: ChatRoom) => {
        switch (room.roomType) {
            case 'global':
                return <Globe className="w-5 h-5 text-[#FF6B35]" />;
            case 'group':
                return <Users className="w-5 h-5 text-cyan-400" />;
            case 'direct':
                return <MessageCircle className="w-5 h-5 text-purple-400" />;
        }
    };

    const getUnreadCount = (room: ChatRoom) => {
        return room.unreadCounts?.[userCode] || 0;
    };

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] border-r-2 border-[#1A1A1A]">
            {/* Header */}
            <div className="p-4 border-b-2 border-[#1A1A1A]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black uppercase tracking-wider text-[#FF6B35]">
                        💬 COMMS
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onNewDM}
                        className="p-2 rounded bg-[#1A1A1A] hover:bg-[#FF6B35] hover:text-black transition-colors"
                        title="New Direct Message"
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-[#0D0D0D] border-2 border-[#1A1A1A] rounded-none px-10 py-2 text-sm
                     focus:border-[#FF6B35] focus:outline-none transition-colors
                     placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredRooms.map((room) => {
                    const isActive = room.roomId === activeRoomId;
                    const unreadCount = getUnreadCount(room);

                    return (
                        <motion.button
                            key={room.roomId}
                            onClick={() => onRoomSelect(room)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-3 rounded-none text-left transition-all duration-200 relative
                ${isActive
                                    ? 'bg-[#FF6B35]/10 border-l-4 border-[#FF6B35]'
                                    : 'hover:bg-[#1A1A1A] border-l-4 border-transparent'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar/Icon */}
                                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0
                  ${room.roomType === 'global' ? 'bg-[#FF6B35]/20' :
                                        room.roomType === 'group' ? 'bg-cyan-400/20' : 'bg-purple-400/20'}`}
                                >
                                    {room.otherParticipant?.avatar ? (
                                        <img
                                            src={room.otherParticipant.avatar}
                                            alt={room.name}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    ) : (
                                        getRoomIcon(room)
                                    )}
                                </div>

                                {/* Room Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`font-bold truncate ${isActive ? 'text-[#FF6B35]' : 'text-white'}`}>
                                            {room.otherParticipant?.name || room.name}
                                        </span>
                                        {room.lastMessage && (
                                            <span className="text-[10px] text-gray-500 flex-shrink-0">
                                                {formatDistanceToNow(new Date(room.lastMessage.createdAt))}
                                            </span>
                                        )}
                                    </div>

                                    {room.lastMessage && (
                                        <p className="text-xs text-gray-400 truncate mt-1">
                                            <span className="text-gray-500">{room.lastMessage.senderName}: </span>
                                            {room.lastMessage.content}
                                        </p>
                                    )}
                                </div>

                                {/* Unread Badge */}
                                {unreadCount > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <span className="bg-[#FF6B35] text-black text-xs font-black px-2 py-0.5 rounded-full
                                   animate-pulse">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}

                {filteredRooms.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No rooms found</p>
                    </div>
                )}
            </div>

            {/* Connection Status */}
            <div className="p-3 border-t-2 border-[#1A1A1A]">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Connected as <span className="text-white font-mono">{userCode}</span></span>
                </div>
            </div>
        </div>
    );
}
