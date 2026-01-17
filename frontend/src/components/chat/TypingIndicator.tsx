import { motion } from 'framer-motion';

interface TypingIndicatorProps {
    typingUsers: { userCode: string; userName: string }[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null;

    const getMessage = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].userName} is typing`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
        } else {
            return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing`;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-2"
        >
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-[#FF6B35] rounded-full"
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </div>
            <span className="text-xs text-gray-400 italic">{getMessage()}</span>
        </motion.div>
    );
}
