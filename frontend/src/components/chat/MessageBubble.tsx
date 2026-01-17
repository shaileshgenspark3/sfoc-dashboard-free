import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, MoreHorizontal, Smile, Trash2 } from 'lucide-react';
import type { ChatMessage } from '../../services/api';
import { formatDistanceToNow } from '../../utils/formatters';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    userCode: string;
    onReaction: (messageId: string, emoji: string) => void;
    onDelete?: (messageId: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '💪'];

export default function MessageBubble({
    message,
    isOwnMessage,
    userCode,
    onReaction,
    onDelete,
}: MessageBubbleProps) {
    const [showReactions, setShowReactions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isRead = message.readBy.length > 1 ||
        (message.readBy.length === 1 && message.readBy[0] !== message.senderCode);

    // Parse mentions in content
    const renderContent = () => {
        const mentionRegex = /@([A-Z0-9]{6})/g;
        const parts = message.content.split(mentionRegex);

        return parts.map((part, index) => {
            if (index % 2 === 1) {
                // This is a mention
                const isSelfMention = part === userCode;
                return (
                    <span
                        key={index}
                        className={`font-bold ${isSelfMention ? 'text-[#FF6B35] bg-[#FF6B35]/20 px-1 rounded' : 'text-cyan-400'}`}
                    >
                        @{part}
                    </span>
                );
            }
            return part;
        });
    };

    const totalReactions = message.reactions.reduce((sum, r) => sum + r.userCodes.length, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
        >
            <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Sender Name (for others) */}
                {!isOwnMessage && (
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-2">
                        {message.senderName}
                    </span>
                )}

                <div className="relative">
                    {/* Message Bubble */}
                    <div
                        className={`relative px-4 py-2.5 rounded-none
              ${isOwnMessage
                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-black'
                                : 'bg-[#1A1A1A] text-white border-l-2 border-cyan-400/50'
                            }
              ${message.isDeleted ? 'opacity-50 italic' : ''}
            `}
                        style={{
                            clipPath: isOwnMessage
                                ? 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)'
                                : 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)'
                        }}
                    >
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {message.isDeleted ? '🗑️ This message was deleted' : renderContent()}
                        </p>
                    </div>

                    {/* Hover Actions */}
                    {!message.isDeleted && (
                        <div className={`absolute top-1/2 -translate-y-1/2 
              ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'}
              opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => setShowReactions(!showReactions)}
                                className="p-1.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded hover:border-[#FF6B35]"
                            >
                                <Smile className="w-4 h-4" />
                            </motion.button>
                            {isOwnMessage && onDelete && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1.5 bg-[#0D0D0D] border border-[#1A1A1A] rounded hover:border-red-500"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </motion.button>
                            )}
                        </div>
                    )}

                    {/* Quick Reaction Picker */}
                    <AnimatePresence>
                        {showReactions && (
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} bottom-full mb-2 
                  flex gap-1 p-2 bg-[#0D0D0D] border-2 border-[#1A1A1A] rounded-lg shadow-xl z-10`}
                            >
                                {QUICK_REACTIONS.map((emoji) => (
                                    <motion.button
                                        key={emoji}
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            onReaction(message._id, emoji);
                                            setShowReactions(false);
                                        }}
                                        className="text-xl p-1 hover:bg-[#1A1A1A] rounded"
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Delete Menu */}
                    <AnimatePresence>
                        {showMenu && isOwnMessage && onDelete && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute right-0 bottom-full mb-2 
                  bg-[#0D0D0D] border-2 border-[#1A1A1A] rounded shadow-xl z-10 overflow-hidden"
                            >
                                <button
                                    onClick={() => {
                                        onDelete(message._id);
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 w-full text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Reactions Display */}
                {totalReactions > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {message.reactions.map((reaction) => (
                            <motion.button
                                key={reaction.emoji}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onReaction(message._id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                  ${reaction.userCodes.includes(userCode)
                                        ? 'bg-[#FF6B35]/20 border border-[#FF6B35]'
                                        : 'bg-[#1A1A1A] border border-[#2A2A2A]'
                                    }`}
                            >
                                <span>{reaction.emoji}</span>
                                <span className="font-bold">{reaction.userCodes.length}</span>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Timestamp & Read Status */}
                <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(new Date(message.createdAt))}
                    </span>
                    {isOwnMessage && (
                        <span className="text-gray-400">
                            {isRead ? (
                                <CheckCheck className="w-3 h-3 text-cyan-400" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
