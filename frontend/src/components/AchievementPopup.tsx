import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Participant } from '../services/api';
import { IconMap } from '../utils/iconMap';
import confetti from 'canvas-confetti';
import { StunningBadgeShareCard } from './StunningBadgeShareCard';
import { getRandomQuote } from '../utils/quotes';
import html2canvas from 'html2canvas'; // Make sure this is installed
import toast from 'react-hot-toast';
import { Share2, X, Download } from 'lucide-react';

interface Props {
  badges: Badge[];
  participant: Participant | null; // Need participant for the share card
  onClose: () => void;
}

export const AchievementPopup: React.FC<Props> = ({ badges, participant, onClose }) => {
  const shareRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

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

  const handleShare = async (badge: Badge) => {
    if (!shareRef.current) return;
    setSharing(true);
    const toastId = toast.loading('GENERATING_TACTICAL_ASSET...');

    try {
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(shareRef.current, {
        scale: 3,
        backgroundColor: '#050505',
        useCORS: true
      } as any);

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ACHIEVEMENT_${badge.id}_${Date.now()}.png`;
      link.href = image;
      link.click();

      toast.success('ASSET_SECURED', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('GENERATION_FAILED', { id: toastId });
    } finally {
      setSharing(false);
    }
  };

  if (badges.length === 0) return null;

  // We'll just show the first badge for the share card focus if multiple
  const currentBadge = badges[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-[#0A0A0A] border-2 border-neon-green rounded-xl max-w-md w-full shadow-[0_0_100px_rgba(0,255,0,0.2)] relative overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/40">
            <h2 className="text-2xl font-black font-display text-white tracking-widest uppercase italic">
              PROTOCOL <span className="text-neon-green">UNLOCKED</span>
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="text-center mb-8 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl -z-10"
              />
              <div className="space-y-8">
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
                      className="flex flex-col items-center"
                    >
                      <div className={`p-6 rounded-full bg-[#111] mb-6 border-4 ${borderColor} shadow-[0_0_30px_rgba(255,255,255,0.1)]`}>
                        <Icon className={`w-16 h-16 ${textColor}`} />
                      </div>
                      <h3 className={`text-3xl font-black ${textColor} mb-2 uppercase tracking-tight`}>{badge.name}</h3>
                      <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-4">{badge.description}</p>

                      {/* Share Button for this specific badge */}
                      {participant && (
                        <button
                          onClick={() => handleShare(badge)}
                          disabled={sharing}
                          className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333] hover:border-neon-green hover:text-neon-green text-gray-300 font-bold uppercase text-xs tracking-widest transition-all rounded"
                        >
                          {sharing ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
                          ) : (
                            <Share2 size={16} />
                          )}
                          SHARE_ACHIEVEMENT
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-neon-green text-black font-black text-lg tracking-widest uppercase hover:bg-neon-green/90 transition-colors shadow-[0_0_20px_rgba(0,255,0,0.4)] clip-path-slant"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)' }}
            >
              ACKNOWLEDGE_REWARD
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Hidden Share Card Render Area */}
      {participant && (
        <div className="fixed left-[-9999px] top-[-9999px]">
          <StunningBadgeShareCard
            ref={shareRef}
            participant={participant}
            badge={currentBadge}
            quote={getRandomQuote()}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

