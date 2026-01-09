import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Trophy, Medal, Crown, TrendingUp, Flame, User, Target, Zap, Activity, Lock } from 'lucide-react';
import Confetti, { winnerCelebration } from '../components/Confetti';
import { activitiesApi, participantsApi, Participant, settingsApi } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await settingsApi.get('show_leaderboard');
      setIsEnabled(res.data.value);
      if (res.data.value) {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error checking status');
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await participantsApi.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-6 bg-[#1A1A1A] border border-[#2D2D2D] industrial-panel">
          <Lock size={64} className="text-[#FF6B35] mx-auto mb-4" />
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">LEADERBOARD_LOCKED</h2>
          <p className="text-gray-500 max-w-md mx-auto mt-2 font-bold text-xs uppercase tracking-widest">
            The ranking protocols are currently encrypted by mission command. 
            Check back later for synchronization.
          </p>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleCelebrate = () => {
    winnerCelebration();
    toast.success('CELEBRATION_SEQUENCE_INITIATED');
  };

  return (
    <div className="space-y-12">
      <Confetti trigger={false} />
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#3F3F3F] pb-4">
        <div>
          <div className="tech-label">MODULE: RANK_PROTOCOLS</div>
          <h2 className="text-3xl tracking-tighter">GLOBAL_LEADERBOARD</h2>
        </div>
        <div className="hidden sm:block text-right">
          <div className="tech-label">SYNC_STATUS</div>
          <div className="text-[#2ECC71] text-[10px] font-bold tracking-widest uppercase">UP_TO_DATE</div>
        </div>
      </header>

      {/* Top Assets */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 0, 2].map((idx) => {
            const p = leaderboard[idx];
            const isFirst = idx === 0;
            return (
              <motion.div
                key={p.individualCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`industrial-panel p-8 flex flex-col items-center gap-6 relative ${
                  isFirst ? 'border-t-4 border-t-[#FF6B35] bg-[#FF6B35]/5' : ''
                }`}
              >
                <div className="tech-label absolute top-4 left-4">RANK_0{idx + 1}</div>
                
                <div className={`w-24 h-24 flex items-center justify-center border-2 ${
                  isFirst ? 'border-[#FF6B35] bg-[#FF6B35] text-black' : 'border-[#3F3F3F] text-white'
                } font-black text-4xl`}>
                  {p.name.charAt(0)}
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold truncate max-w-[200px]">{p.name}</h3>
                  <div className="text-[10px] text-[#8C8C8C] font-bold tracking-widest">{p.individualCode}</div>
                </div>

                <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t border-[#3F3F3F]">
                  <div className="text-center">
                    <div className="tech-label">TOTAL_POINTS</div>
                    <div className="text-lg font-bold">{(p.totalPoints || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="tech-label">DISTANCE</div>
                    <div className="text-lg font-bold">{p.totalDistance.toFixed(1)}KM</div>
                  </div>
                </div>

                {isFirst && (
                  <button 
                    onClick={handleCelebrate}
                    className="mt-4 px-4 py-2 border border-[#FF6B35] text-[#FF6B35] text-[10px] font-bold tracking-widest hover:bg-[#FF6B35] hover:text-black transition-colors"
                  >
                    TRIGGER_CELEBRATION
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Registry */}
      <div className="industrial-panel overflow-hidden border-l-4 border-l-[#FF6B35]">
        <div className="p-4 bg-[#262626] border-b border-[#3F3F3F] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Target className="text-[#FF6B35]" size={18} />
            <h3 className="text-sm font-bold tracking-widest">FULL_REGISTRY_INDEX</h3>
          </div>
          <span className="text-[10px] font-bold text-[#4A4A4A] tracking-widest">COUNT: {leaderboard.length}</span>
        </div>

        <div className="divide-y divide-[#3F3F3F]">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent animate-spin" />
              <div className="tech-label animate-pulse">RETRIVING_DATA_PACKETS...</div>
            </div>
          ) : (
            leaderboard.map((p, index) => (
              <motion.div
                key={p.individualCode}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-4 flex items-center gap-6 group hover:bg-[#262626] transition-colors"
              >
                <div className="w-8 text-sm font-black text-[#4A4A4A] group-hover:text-[#FF6B35]">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                
                <div className="w-10 h-10 border border-[#3F3F3F] flex items-center justify-center font-bold text-white group-hover:border-[#FF6B35]">
                  {p.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate uppercase">{p.name}</h4>
                  <p className="text-[10px] text-[#4A4A4A] font-bold tracking-wider">{p.individualCode}</p>
                </div>

                <div className="hidden sm:flex flex-col items-end min-w-[100px]">
                  <div className="tech-label">TOTAL_POINTS</div>
                  <div className="text-sm font-bold text-[#FF6B35]">{(p.totalPoints || 0).toLocaleString()}</div>
                </div>

                <div className="hidden md:flex flex-col items-end min-w-[100px]">
                  <div className="tech-label">DISTANCE</div>
                  <div className="text-sm font-bold">{p.totalDistance.toFixed(1)} KM</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
