import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MessageCircle } from 'lucide-react';
import type { Participant } from '../../services/api';

interface NewDMModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    onSelectParticipant: (participant: Participant) => void;
}

export default function NewDMModal({
    isOpen,
    onClose,
    participants,
    onSelectParticipant,
}: NewDMModalProps) {
    const [search, setSearch] = useState('');

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.individualCode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0D0D0D] border-2 border-[#1A1A1A] w-full max-w-md max-h-[80vh] overflow-hidden
                       shadow-2xl"
                        style={{
                            boxShadow: '20px 20px 0px 0px rgba(255, 107, 53, 0.1)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b-2 border-[#1A1A1A]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FF6B35]/20 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-[#FF6B35]">
                                        New Message
                                    </h2>
                                    <p className="text-xs text-gray-500">Start a direct conversation</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 hover:bg-[#1A1A1A] rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b-2 border-[#1A1A1A]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name or code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                    className="w-full bg-[#0A0A0A] border-2 border-[#1A1A1A] rounded-none px-10 py-3
                           focus:border-[#FF6B35] focus:outline-none transition-colors
                           placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Participants List */}
                        <div className="overflow-y-auto max-h-[50vh] p-2">
                            {filteredParticipants.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredParticipants.map((participant) => (
                                        <motion.button
                                            key={participant.individualCode}
                                            onClick={() => onSelectParticipant(participant)}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full p-3 flex items-center gap-3 rounded-none
                               hover:bg-[#1A1A1A] transition-colors text-left"
                                        >
                                            {/* Avatar */}
                                            <div className="w-12 h-12 bg-[#1A1A1A] rounded flex items-center justify-center
                                    text-lg font-bold text-[#FF6B35] flex-shrink-0 overflow-hidden">
                                                {participant.profilePicture ? (
                                                    <img
                                                        src={participant.profilePicture}
                                                        alt={participant.name}
                                                        className="w-12 h-12 object-cover"
                                                    />
                                                ) : (
                                                    participant.name.charAt(0).toUpperCase()
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white truncate">{participant.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{participant.individualCode}</div>
                                                {participant.groupCode && (
                                                    <div className="text-[10px] text-cyan-400 mt-0.5">
                                                        Squad: {participant.groupCode}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <div className="text-gray-500">→</div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">No participants found</p>
                                    <p className="text-xs mt-1">Try a different search term</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
