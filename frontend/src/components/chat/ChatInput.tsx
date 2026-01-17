import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, AtSign, X } from 'lucide-react';
import type { Participant } from '../../services/api';

interface ChatInputProps {
    onSend: (message: string) => void;
    onTyping: () => void;
    participants: Participant[];
    disabled?: boolean;
    placeholder?: string;
}

const EMOJI_LIST = [
    '😀', '😂', '😍', '🤔', '😎', '🥳', '🔥', '💪', '👍', '❤️',
    '🎉', '✨', '🚀', '💯', '🏃', '🚴', '🧘', '🏋️', '⚡', '🌟'
];

export default function ChatInput({
    onSend,
    onTyping,
    participants,
    disabled = false,
    placeholder = 'Type a message...'
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionIndex, setMentionIndex] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Filter participants based on mention query
    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        p.individualCode.toLowerCase().includes(mentionQuery.toLowerCase())
    ).slice(0, 5);

    // Handle mention detection
    useEffect(() => {
        const match = message.match(/@(\w*)$/);
        if (match) {
            setMentionQuery(match[1]);
            setShowMentions(true);
            setMentionIndex(0);
        } else {
            setShowMentions(false);
        }
    }, [message]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            setShowEmoji(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (showMentions && filteredParticipants.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setMentionIndex((prev) =>
                        prev < filteredParticipants.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setMentionIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredParticipants.length - 1
                    );
                    break;
                case 'Enter':
                    if (!e.shiftKey) {
                        e.preventDefault();
                        insertMention(filteredParticipants[mentionIndex]);
                    }
                    break;
                case 'Escape':
                    setShowMentions(false);
                    break;
            }
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const insertMention = (participant: Participant) => {
        const newMessage = message.replace(/@\w*$/, `@${participant.individualCode} `);
        setMessage(newMessage);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const insertEmoji = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        onTyping();
    };

    return (
        <div className="relative bg-[#0A0A0A] border-t-2 border-[#1A1A1A] p-4">
            {/* Mentions Dropdown */}
            <AnimatePresence>
                {showMentions && filteredParticipants.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-4 right-4 mb-2 bg-[#0D0D0D] border-2 border-[#1A1A1A] 
                       rounded shadow-xl max-h-48 overflow-y-auto z-10"
                    >
                        <div className="p-2 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1A1A1A]">
                            <AtSign className="w-3 h-3 inline mr-1" />
                            Mention someone
                        </div>
                        {filteredParticipants.map((participant, index) => (
                            <motion.button
                                key={participant.individualCode}
                                onClick={() => insertMention(participant)}
                                className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors
                  ${index === mentionIndex ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'hover:bg-[#1A1A1A]'}`}
                            >
                                <div className="w-8 h-8 rounded bg-[#1A1A1A] flex items-center justify-center text-xs font-bold">
                                    {participant.profilePicture ? (
                                        <img
                                            src={participant.profilePicture}
                                            alt={participant.name}
                                            className="w-8 h-8 rounded object-cover"
                                        />
                                    ) : (
                                        participant.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{participant.name}</div>
                                    <div className="text-[10px] text-gray-500 font-mono">{participant.individualCode}</div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emoji Picker */}
            <AnimatePresence>
                {showEmoji && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-4 mb-2 bg-[#0D0D0D] border-2 border-[#1A1A1A] 
                       rounded shadow-xl p-3 z-10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Quick Emojis</span>
                            <button onClick={() => setShowEmoji(false)} className="text-gray-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {EMOJI_LIST.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => insertEmoji(emoji)}
                                    className="text-2xl p-1 hover:bg-[#1A1A1A] rounded"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="flex items-end gap-3">
                {/* Emoji Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-2 rounded transition-colors flex-shrink-0
            ${showEmoji ? 'bg-[#FF6B35] text-black' : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'}`}
                >
                    <Smile className="w-5 h-5" />
                </motion.button>

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="w-full bg-[#0D0D0D] border-2 border-[#1A1A1A] rounded-none px-4 py-3
                     focus:border-[#FF6B35] focus:outline-none transition-colors resize-none
                     placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed
                     max-h-32"
                        style={{ minHeight: '48px' }}
                    />
                </div>

                {/* Mention Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setMessage((prev) => prev + '@');
                        inputRef.current?.focus();
                    }}
                    className="p-2 rounded bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
                >
                    <AtSign className="w-5 h-5" />
                </motion.button>

                {/* Send Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="p-3 rounded-none bg-[#FF6B35] text-black font-bold disabled:opacity-50 
                   disabled:cursor-not-allowed transition-all flex-shrink-0
                   hover:bg-[#FF8C5A] active:translate-x-1 active:translate-y-1"
                    style={{
                        boxShadow: message.trim() && !disabled ? '4px 4px 0px 0px rgba(0, 0, 0, 1)' : 'none'
                    }}
                >
                    <Send className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    );
}
