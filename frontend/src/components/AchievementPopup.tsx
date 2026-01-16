import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../services/api';
import { IconMap } from '../utils/iconMap';
import confetti from 'canvas-confetti';

interface Props {
  badges: Badge[];
  onClose: () => void;
}

export const AchievementPopup: React.FC<Props> = ({ badges, onClose }) => {
  React.useEffect(() => {
    if (badges.length > 0) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-gray-900 border-2 border-neon-green rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,255,0,0.3)] relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Glitch Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent pointer-events-none" />
          
          <div className="text-center relative z-10">
            <motion.h2 
              animate={{ 
                textShadow: [
                  "2px 0px 0px rgba(255,0,0,0.5), -2px 0px 0px rgba(0,0,255,0.5)",
                  "-2px 0px 0px rgba(255,0,0,0.5), 2px 0px 0px rgba(0,0,255,0.5)",
                  "2px 0px 0px rgba(255,0,0,0.5), -2px 0px 0px rgba(0,0,255,0.5)"
                ],
                x: [0, -2, 2, -1, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "mirror" }}
              className="text-3xl font-bold font-display text-white mb-6 tracking-wider uppercase"
            >
              Protocol Unlocked
            </motion.h2>

            <div className="space-y-6">
              {badges.map((badge) => {
                const Icon = IconMap[badge.icon] || IconMap.Trophy;
                const borderColor = badge.color ? badge.color.replace('text-', 'border-') : 'border-gray-500';
                const textColor = badge.color || 'text-gray-500';

                return (
                  <motion.div 
                    key={badge.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className={`p-4 rounded-full bg-gray-800 mb-3 border-2 ${borderColor}`}>
                      <Icon className={`w-12 h-12 ${textColor}`} />
                    </div>
                    <h3 className={`text-xl font-bold ${textColor} mb-1`}>{badge.name}</h3>
                    <p className="text-gray-400 text-sm">{badge.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-neon-green text-black font-bold font-mono rounded-lg hover:bg-neon-green/90 transition-colors shadow-lg shadow-neon-green/20"
            >
              ACKNOWLEDGE
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
