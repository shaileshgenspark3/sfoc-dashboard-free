import React, { forwardRef } from 'react';
import { Participant, Activity, Badge } from '../services/api';
import { format } from 'date-fns';
import { IconMap } from '../utils/iconMap';
import { Zap, Flame, TrendingUp, Clock, MapPin, User } from 'lucide-react';

interface Props {
  participant: Participant;
  todayActivities: Activity[];
}

export const SocialShareCard = forwardRef<HTMLDivElement, Props>(({ participant, todayActivities }, ref) => {
  const todayDate = format(new Date(), 'dd MMM yyyy');
  
  // Calculate today's stats
  const todayDistance = todayActivities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
  const todayDuration = todayActivities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const todayPoints = todayActivities.reduce((acc, curr) => acc + (curr.points || 0), 0);

  // Get top 3 badges (prioritize new ones or rarest)
  const displayBadges = (participant.badges || []).slice(-3).reverse();

  return (
    <div 
      ref={ref}
      className="w-[1080px] h-[1920px] bg-black relative overflow-hidden flex flex-col items-center pt-32 pb-20 px-16 text-white font-sans"
      style={{ 
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000000 100%)'
      }}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-[#FF6B35] rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-neon-green rounded-full blur-[150px] mix-blend-screen" />
      </div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Header */}
      <div className="relative z-10 text-center space-y-4 mb-12 w-full">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold tracking-[0.3em] text-[#FF6B35] uppercase mb-2">SUKRUT PARIVAR PRESENTS</h3>
          <h1 className="text-6xl font-black italic tracking-tighter text-white transform -skew-x-12 uppercase drop-shadow-[0_0_15px_rgba(255,107,53,0.8)]">
            FIT-O-CHARITY
          </h1>
          <div className="w-full max-w-md h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent mt-4" />
        </div>
        <div className="text-3xl font-bold tracking-widest text-gray-400 uppercase font-mono mt-4">
          {todayDate}
        </div>
      </div>

      {/* Main Stats Circle */}
      <div className="relative z-10 mb-12 scale-110">
        <div className="relative w-[500px] h-[500px]">
          {/* Glitch Rings */}
          <div className="absolute inset-0 border-[2px] border-[#FF6B35]/20 rounded-full animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-[-20px] border-[1px] border-neon-green/20 rounded-full animate-[spin_12s_linear_infinite_reverse] border-dashed" />
          <div className="absolute inset-[20px] border-[4px] border-white/5 rounded-full" />
          
          {/* Profile Picture */}
          <div className="absolute inset-4 rounded-full overflow-hidden border-[6px] border-[#1A1A1A] shadow-[0_0_80px_rgba(255,107,53,0.3)] bg-[#1A1A1A] relative group">
            {participant.profilePicture ? (
              <img 
                src={participant.profilePicture.startsWith('http') ? participant.profilePicture : `${import.meta.env.VITE_API_URL}${participant.profilePicture}`} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <User size={150} className="text-gray-700" />
              </div>
            )}
            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzQx/giphy.gif')] opacity-5 mix-blend-overlay pointer-events-none" />
          </div>

          {/* Today's Score Badge */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black/90 border-2 border-neon-green px-10 py-6 rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.3)] flex items-center gap-6 min-w-[340px] justify-center backdrop-blur-md transform hover:scale-105 transition-transform">
            <div className="p-3 bg-neon-green/10 rounded-lg border border-neon-green/30">
              <Zap size={48} className="text-neon-green fill-neon-green" />
            </div>
            <div className="text-left">
              <div className="text-6xl font-black text-white leading-none tracking-tighter">{Math.round(todayPoints)}</div>
              <div className="text-xs font-bold text-neon-green tracking-[0.3em] uppercase mt-1">Daily Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Name */}
      <div className="relative z-10 text-center mb-16 space-y-2">
        <h2 className="text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
          {participant.name}
        </h2>
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#1A1A1A] border border-gray-700 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xl font-bold text-gray-400 tracking-[0.2em] font-mono">{participant.individualCode}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-8 w-full max-w-3xl mb-16">
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border-l-8 border-[#FF6B35] p-8 rounded-r-2xl">
          <div className="flex items-center gap-4 mb-2">
            <TrendingUp size={32} className="text-[#FF6B35]" />
            <span className="text-2xl font-bold text-gray-400">DISTANCE</span>
          </div>
          <div className="text-6xl font-black text-white">{todayDistance.toFixed(1)} <span className="text-2xl text-gray-500">KM</span></div>
        </div>
        
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border-l-8 border-neon-green p-8 rounded-r-2xl">
          <div className="flex items-center gap-4 mb-2">
            <Clock size={32} className="text-neon-green" />
            <span className="text-2xl font-bold text-gray-400">DURATION</span>
          </div>
          <div className="text-6xl font-black text-white">{todayDuration} <span className="text-2xl text-gray-500">MIN</span></div>
        </div>

        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border-l-8 border-blue-500 p-8 rounded-r-2xl col-span-2 flex items-center justify-between px-12">
          <div className="flex items-center gap-6">
            <Flame size={40} className="text-blue-500 fill-current" />
            <span className="text-3xl font-bold text-gray-400">CURRENT STREAK</span>
          </div>
          <div className="text-6xl font-black text-white">{participant.streakDays} <span className="text-2xl text-gray-500">DAYS</span></div>
        </div>
      </div>

      {/* Badges Row */}
      {displayBadges.length > 0 && (
        <div className="relative z-10 w-full max-w-3xl">
          <div className="text-center text-gray-500 tracking-widest text-xl mb-6 uppercase font-bold">Latest Achievements</div>
          <div className="flex justify-center gap-8">
            {displayBadges.map((badge) => {
              const Icon = IconMap[badge.icon] || IconMap.Trophy;
              return (
                <div key={badge.id} className="flex flex-col items-center gap-3">
                  <div className={`p-6 rounded-full bg-[#1A1A1A] border-2 ${badge.color.replace('text-', 'border-')} shadow-lg`}>
                    <Icon className={`w-12 h-12 ${badge.color}`} />
                  </div>
                  <span className="text-lg font-bold text-gray-300">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto relative z-10 flex flex-col items-center gap-4">
        <div className="w-24 h-1 bg-[#FF6B35]" />
        <div className="text-2xl font-black tracking-widest uppercase">
          #CHALLENGE_ACCEPTED
        </div>
      </div>
    </div>
  );
});

SocialShareCard.displayName = 'SocialShareCard';
