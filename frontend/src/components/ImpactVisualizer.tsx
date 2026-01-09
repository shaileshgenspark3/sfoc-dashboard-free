import { motion } from 'framer-motion';
import { Heart, Zap, IndianRupee, Trophy } from 'lucide-react';

interface ImpactVisualizerProps {
  totalPoints: number;
}

const ImpactVisualizer = ({ totalPoints = 0 }: ImpactVisualizerProps) => {
  // Goal: Rs. 1,00,000 contribution
  const goalAmount = 100000;
  const currentContribution = (totalPoints || 0) * 10;
  const progress = isNaN(currentContribution / goalAmount) ? 0 : Math.min((currentContribution / goalAmount) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="industrial-panel p-8 border-t-4 border-t-[#FF6B35] relative overflow-hidden bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A]"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Heart size={200} fill="#FF6B35" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: The Counter */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B35] text-black">
              <IndianRupee size={24} strokeWidth={3} />
            </div>
            <div className="tech-label text-[#FF6B35]">IMPACT_METER: CHARITY_GENERATED</div>
          </div>
          
          <div className="space-y-1">
            <motion.h2 
              key={currentContribution}
              initial={{ scale: 1.1, color: '#FF6B35' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              className="text-6xl md:text-7xl font-black tracking-tighter"
            >
              ₹{currentContribution.toLocaleString()}
            </motion.h2>
            <p className="text-[#8C8C8C] font-bold text-sm tracking-widest uppercase italic">
              Funded by Sukrut Parivar Charitable Trust
            </p>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex flex-col">
              <span className="tech-label">FUEL_SOURCE</span>
              <span className="text-white font-black flex items-center gap-2">
                <Zap size={14} className="text-[#FF6B35]" fill="currentColor" />
                {totalPoints.toLocaleString()} POINTS
              </span>
            </div>
            <div className="w-[1px] h-10 bg-[#2D2D2D]" />
            <div className="flex flex-col">
              <span className="tech-label">EXCHANGE_RATE</span>
              <span className="text-white font-black">1 PT = ₹10</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Meter */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white italic">MISSION_PROGRESS</h3>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest">COLLECTIVE_OPERATIVE_EFFORT</p>
            </div>
            <div className="text-right">
              <div className="text-[#FF6B35] font-black text-2xl tracking-tighter">{progress.toFixed(1)}%</div>
              <div className="tech-label">SYNC_STATUS: LIVE</div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-12 bg-black border-2 border-[#2D2D2D] p-1 overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-20">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-[1px] h-full bg-white" />
              ))}
            </div>
            
            {/* The Actual Progress */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.5)] relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'MILESTONE_01', val: '₹25K', active: currentContribution >= 25000 },
              { label: 'MILESTONE_02', val: '₹50K', active: currentContribution >= 50000 },
              { label: 'MILESTONE_03', val: '₹100K', active: currentContribution >= 100000 },
            ].map((m, i) => (
              <div key={i} className={`p-3 border transition-colors ${m.active ? 'border-[#FF6B35] bg-[#FF6B35]/10' : 'border-[#2D2D2D] bg-black/40'}`}>
                <div className={`tech-label ${m.active ? 'text-[#FF6B35]' : 'text-gray-600'}`}>{m.label}</div>
                <div className={`text-xs font-black ${m.active ? 'text-white' : 'text-gray-700'}`}>{m.val} {m.active ? '✓' : 'LOCKED'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Protocol Alert */}
      <div className="mt-8 pt-6 border-t border-[#2D2D2D] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="animate-bounce">
            <Trophy className="text-yellow-500" size={32} />
          </div>
          <div>
            <span className="text-white font-black text-sm uppercase tracking-tighter block">REWARD_PROTOCOL_ACTIVE</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Top operatives are eligible for physical trophies upon mission completion.</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-[#FF6B35]/5 border border-[#FF6B35]/20 text-[10px] font-black text-[#FF6B35] tracking-[0.2em] animate-pulse">
          EVERY_POINT_MATTERS_BY_SUKRUT_TRUST
        </div>
      </div>
    </motion.div>
  );
};

export default ImpactVisualizer;
