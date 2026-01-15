import React, { forwardRef } from 'react';
import { Participant, Activity } from '../services/api';
import { format } from 'date-fns';
import { IconMap } from '../utils/iconMap';
import { Zap, Flame, TrendingUp, Clock, User, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  participant: Participant;
  todayActivities: Activity[];
}

export const SocialShareCard = forwardRef<HTMLDivElement, Props>(({ participant, todayActivities }, ref) => {
  const todayDate = format(new Date(), 'dd MMMM yyyy');
  
  // Calculate today's stats
  const todayDistance = todayActivities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
  const todayDuration = todayActivities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const todayPoints = todayActivities.reduce((acc, curr) => acc + (curr.points || 0), 0);

  // Get top 3 badges
  const displayBadges = (participant.badges || []).slice(-3).reverse();

  return (
    <div 
      ref={ref}
      className="w-[1080px] h-[1920px] bg-[#050505] relative overflow-hidden flex flex-col font-sans text-white"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100" />
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#FF6B35]/20 to-transparent" />
      <div className="absolute bottom-0 w-full h-[600px] bg-gradient-to-t from-neon-green/10 to-transparent" />

      {/* Header Section */}
      <div className="pt-24 px-16 text-center relative z-10">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="h-[2px] w-12 bg-[#FF6B35]" />
          <span className="text-2xl font-bold tracking-[0.4em] text-[#FF6B35] uppercase">Sukrut Parivar</span>
          <div className="h-[2px] w-12 bg-[#FF6B35]" />
        </div>
        <h1 className="text-8xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
          FIT-O-CHARITY
        </h1>
        <p className="text-3xl text-gray-400 font-bold mt-4 tracking-widest uppercase">{todayDate}</p>
      </div>

      {/* Profile Section */}
      <div className="mt-20 flex flex-col items-center relative z-10">
        <div className="relative">
          {/* Glowing Rings */}
          <div className="absolute inset-[-20px] border-2 border-[#FF6B35] rounded-full animate-[spin_20s_linear_infinite] opacity-50 border-dashed" />
          <div className="absolute inset-[-40px] border-2 border-neon-green rounded-full animate-[spin_15s_linear_infinite_reverse] opacity-30" />
          
          <div className="w-[400px] h-[400px] rounded-full overflow-hidden border-[8px] border-[#1A1A1A] shadow-2xl relative z-10 bg-[#1A1A1A]">
            {participant.profilePicture ? (
              <img 
                src={participant.profilePicture.startsWith('http') ? participant.profilePicture : `${import.meta.env.VITE_API_URL}${participant.profilePicture}`} 
                className="w-full h-full object-cover"
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <User size={150} className="text-gray-700" />
              </div>
            )}
          </div>
          
          {/* Rank Badge */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-black px-8 py-2 rounded-full font-black text-2xl uppercase tracking-wider shadow-lg z-20 whitespace-nowrap">
            Elite Operative
          </div>
        </div>

        <h2 className="text-7xl font-black mt-16 text-center uppercase tracking-tighter max-w-4xl leading-tight">
          {participant.name}
        </h2>
        <div className="mt-4 px-6 py-2 border border-gray-700 rounded-lg text-2xl font-mono text-gray-400 tracking-[0.2em]">
          ID: {participant.individualCode}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-24 px-16 relative z-10">
        <div className="grid grid-cols-2 gap-8">
          {/* Today's Impact */}
          <div className="col-span-2 bg-[#1A1A1A]/80 border-l-8 border-[#FF6B35] p-10 rounded-r-3xl flex justify-between items-center backdrop-blur-md">
            <div>
              <div className="flex items-center gap-4 mb-2 text-[#FF6B35]">
                <Zap size={40} fill="currentColor" />
                <span className="text-3xl font-black uppercase tracking-wider">Daily Impact</span>
              </div>
              <div className="text-8xl font-black text-white">{Math.round(todayPoints)} <span className="text-3xl text-gray-500 font-bold">PTS</span></div>
            </div>
            <div className="text-right">
              <div className="text-2xl text-gray-400 font-bold mb-1">STREAK</div>
              <div className="text-6xl font-black text-white flex items-center justify-end gap-3">
                {participant.streakDays} <Flame size={48} className="text-[#FF6B35] fill-[#FF6B35]" />
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-[#1A1A1A]/80 border-t-8 border-neon-green p-10 rounded-b-3xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-neon-green">
              <TrendingUp size={32} />
              <span className="text-2xl font-black uppercase tracking-wider">Distance</span>
            </div>
            <div className="text-6xl font-black text-white">{todayDistance.toFixed(1)} <span className="text-2xl text-gray-500">KM</span></div>
          </div>

          {/* Duration */}
          <div className="bg-[#1A1A1A]/80 border-t-8 border-blue-500 p-10 rounded-b-3xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <Clock size={32} />
              <span className="text-2xl font-black uppercase tracking-wider">Duration</span>
            </div>
            <div className="text-6xl font-black text-white">{todayDuration} <span className="text-2xl text-gray-500">MIN</span></div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {displayBadges.length > 0 && (
        <div className="mt-16 px-16 relative z-10">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-gray-500 tracking-[0.3em] uppercase border-b border-gray-700 pb-2">Unlocked Protocols</span>
          </div>
          <div className="flex justify-center gap-12">
            {displayBadges.map((badge) => {
              const Icon = IconMap[badge.icon] || IconMap.Trophy;
              return (
                <div key={badge.id} className="flex flex-col items-center gap-4">
                  <div className={`p-6 rounded-2xl bg-[#1A1A1A] border-2 ${badge.color.replace('text-', 'border-')} shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                    <Icon className={`w-16 h-16 ${badge.color}`} />
                  </div>
                  <span className="text-xl font-bold text-gray-300">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer / CTA */}
      <div className="mt-auto bg-[#1A1A1A] p-16 flex items-center justify-between border-t-4 border-[#FF6B35] relative z-10">
        <div className="flex items-center gap-8">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG 
              value="https://fit-o-charity-chatbot.vercel.app/"
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-black uppercase text-white">Join the Mission</h3>
            <div className="flex items-center gap-3 text-2xl text-gray-400 font-mono">
              <ExternalLink size={24} />
              fit-o-charity-chatbot.vercel.app
            </div>
            <p className="text-xl text-[#FF6B35] font-bold mt-2">SCAN TO KNOW MORE</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-7xl font-black text-[#2D2D2D] uppercase tracking-widest">2026</div>
        </div>
      </div>
    </div>
  );
});

SocialShareCard.displayName = 'SocialShareCard';
