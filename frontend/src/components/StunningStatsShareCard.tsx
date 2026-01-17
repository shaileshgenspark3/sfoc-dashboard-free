import React, { forwardRef } from 'react';
import { Participant, Activity } from '../services/api';
import { format } from 'date-fns';
import { IconMap } from '../utils/iconMap';
import { BADGE_DEFINITIONS } from '../utils/badgeDefinitions';
import { Zap, Flame, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getAssetUrl } from '../utils/urlHelper';

interface Props {
    participant: Participant;
    todayActivities: Activity[];
}

export const StunningStatsShareCard = forwardRef<HTMLDivElement, Props>(({ participant, todayActivities }, ref) => {
    const todayDate = format(new Date(), 'dd MMMM yyyy');

    // Calculate today's stats
    const todayDistance = todayActivities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    const todayDuration = todayActivities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const todayPoints = todayActivities.reduce((acc, curr) => acc + (curr.points || 0), 0);

    // Charity Calculation (Matches Dashboard: 1 Point = ₹10)
    const charityAmount = participant.totalPoints * 10;

    // Get top 3 badges
    const displayBadges = (participant.badges || []).slice(-3).reverse();

    return (
        <div
            ref={ref}
            className="w-[1080px] h-[1920px] bg-[#000] relative overflow-hidden flex flex-col font-sans text-white selection:bg-none"
        >
            {/* --- Background Elements --- */}
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Ambient Gradients - Intense "High Voltage" Theme */}
            <div className="absolute top-[-20%] right-[-20%] w-[120%] h-[120%] bg-gradient-to-bl from-blue-600/30 via-purple-900/20 to-transparent z-0 blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[120%] h-[120%] bg-gradient-to-tr from-[#FF6B35]/30 to-transparent z-0 blur-[120px]" />

            {/* Grid */}
            <div
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }}
            />

            {/* --- Header (Branded & Large) --- */}
            <div className="z-10 w-full pt-16 px-12 flex justify-between items-end border-b border-white/10 pb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-16 bg-[#FF6B35]" />
                        <h2 className="text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Fit-O-Charity</h2>
                    </div>
                    <h3 className="text-3xl font-bold text-[#FF6B35] tracking-[0.2em] uppercase ml-20">by Sukrut Parivar</h3>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-mono text-gray-500 tracking-widest uppercase block mb-2">Performance Cycle</span>
                    <span className="text-3xl font-mono text-gray-300 tracking-widest uppercase">{todayDate}</span>
                </div>
            </div>

            {/* --- Profile & Daily Impact Section --- */}
            <div className="z-10 px-12 pt-10 flex gap-8 items-stretch h-[420px]">
                {/* Profile Pic with Overlay */}
                <div className="w-[420px] relative rounded-[3rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border-4 border-gray-800 bg-gray-900 group">
                    {participant.profilePicture ? (
                        <img 
                            src={getAssetUrl(participant.profilePicture)} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                            alt={participant.name} 
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 font-black text-9xl">
                            {participant.individualCode.substring(0, 2)}
                        </div>
                    )}
                    {/* Gradient Overlay for Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                    
                    {/* Overlaid Text */}
                    <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end">
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-3 drop-shadow-xl break-words">{participant.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-[#FF6B35] text-black text-xl font-bold rounded-lg uppercase tracking-wider shadow-lg">Agent</span>
                            <span className="text-2xl text-gray-300 font-mono tracking-widest">{participant.individualCode}</span>
                        </div>
                    </div>
                </div>

                {/* Small Daily Impact (Beside Profile) */}
                <div className="flex-1 bg-gradient-to-br from-[#1a0a00] to-black border border-[#FF6B35]/30 rounded-[3rem] p-10 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10 text-[#FF6B35]">
                        <Zap size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-center">
                        <div className="flex items-center gap-3 text-[#FF6B35] mb-2">
                            <Zap size={36} fill="currentColor" />
                            <span className="text-2xl font-black uppercase tracking-widest">Daily Impact</span>
                        </div>
                        <div className="text-8xl font-black text-white tracking-tighter leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                            {Math.round(todayPoints)}
                        </div>
                        <span className="text-3xl text-gray-500 font-bold mt-2 tracking-wide uppercase">Points Earned Today</span>
                        
                        {/* Progress Bar Decoration */}
                        <div className="w-full h-3 bg-gray-800/50 rounded-full mt-8 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF9E00] w-[70%] shadow-[0_0_20px_#FF6B35]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Stats Grid --- */}
            <div className="z-10 px-12 mt-8 flex flex-col gap-6">

                {/* Hero: Charity Impact */}
                <div className="w-full bg-gradient-to-r from-[#2c001e] via-[#3a0b2e] to-black border border-pink-500/30 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl flex items-center justify-between">
                    {/* Background SVG */}
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-20 text-pink-500 mix-blend-screen">
                         <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                    </div>

                    <div className="relative z-10 pl-4">
                        <div className="flex items-center gap-4 text-pink-400 mb-2">
                             <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            <span className="text-3xl font-black uppercase tracking-widest text-[#FFC1CC]">Charity Impact</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-400 tracking-wide uppercase block">Total Contribution Generated</span>
                    </div>

                    <div className="relative z-10 pr-8">
                         <div className="text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_35px_rgba(236,72,153,0.6)] flex items-baseline gap-2">
                            <span className="text-6xl text-pink-500 align-top mt-4">₹</span>
                            {charityAmount.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* 3-Column Grid: Distance, Duration, Streak */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Distance */}
                    <div className="bg-gradient-to-br from-[#051a05] to-black border border-neon-green/20 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden shadow-2xl h-[280px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-neon-green/10 to-transparent" />
                        <div className="absolute -right-6 -bottom-6 opacity-10 text-neon-green">
                            <TrendingUp size={140} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-neon-green text-2xl font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                <TrendingUp size={28} /> Distance
                            </div>
                            <div className="text-7xl font-black text-white tracking-tight">
                                {todayDistance.toFixed(1)} <span className="text-2xl text-gray-500">KM</span>
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="bg-gradient-to-br from-[#050a1a] to-black border border-blue-500/20 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden shadow-2xl h-[280px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent" />
                        <div className="absolute -right-6 -bottom-6 opacity-10 text-blue-500">
                            <Clock size={140} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-blue-500 text-2xl font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock size={28} /> Duration
                            </div>
                            <div className="text-7xl font-black text-white tracking-tight">
                                {todayDuration} <span className="text-2xl text-gray-500">MIN</span>
                            </div>
                        </div>
                    </div>

                    {/* Streak */}
                     <div className="bg-gradient-to-br from-[#1a0a00] to-black border border-orange-500/20 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden shadow-2xl h-[280px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 to-transparent" />
                        <div className="absolute -right-6 -bottom-6 opacity-10 text-orange-500">
                            <Flame size={140} />
                        </div>
                        <div className="relative z-10">
                             <div className="text-orange-500 text-2xl font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Flame size={28} /> Streak
                            </div>
                            <div className="text-7xl font-black text-white tracking-tighter">
                                {participant.streakDays} <span className="text-2xl text-gray-500">DAYS</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- Recent Achievements --- */}
            {displayBadges.length > 0 && (
                <div className="z-10 px-12 mt-10">
                    <div className="text-xl font-bold text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                        <span className="text-white/60">Milestones Reached</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                    </div>

                    <div className="flex justify-center gap-8">
                        {displayBadges.map(badge => {
                            const def = BADGE_DEFINITIONS.find(d => d.id === badge.id) || { icon: 'Trophy', color: 'text-gray-500' } as any;
                            const Icon = IconMap[def.icon] || IconMap.Trophy;

                            return (
                                <div key={badge.id} className={`flex-1 bg-black/40 border ${def.color.replace('text-', 'border-')} border-opacity-40 rounded-3xl p-6 flex items-center gap-6 shadow-xl backdrop-blur-md`}>
                                    <div className="p-4 bg-white/10 rounded-2xl">
                                        <Icon className={`w-12 h-12 ${def.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-black uppercase ${def.color} tracking-wide`}>{badge.name}</div>
                                        <div className="text-base text-gray-400 font-mono mt-1 font-bold">{format(new Date(badge.unlockedAt), 'MMM dd')}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* --- Footer (Locked to Bottom) --- */}
            <div className="absolute bottom-0 left-0 w-full z-20 bg-[#050505]/90 backdrop-blur-xl border-t border-gray-800 p-16">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex flex-col gap-2 mb-3">
                            <h3 className="text-6xl font-black text-white uppercase tracking-tight leading-none">Fit-O-Charity</h3>
                            <h4 className="text-4xl font-bold text-[#FF6B35] uppercase tracking-widest flex items-center gap-4">
                                <span className="text-gray-600 text-2xl tracking-normal normal-case font-medium">by</span> Sukrut Parivar
                            </h4>
                        </div>
                        <div className="text-3xl text-gray-400 font-medium tracking-wide mt-4">
                            Fitness for a Cause // <strong className="text-white">Make Every Step Count</strong>
                        </div>
                    </div>

                    <div className="flex items-center gap-10 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                        <div className="text-right">
                            <p className="text-gray-400 text-lg font-bold uppercase tracking-[0.2em] mb-3">Scan to Join</p>
                            <div className="flex items-center gap-4 text-white font-black text-3xl">
                                <ExternalLink size={32} /> fit-o-charity.app
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                            <QRCodeSVG value="https://fit-o-charity.app" size={160} level="H" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
});

StunningStatsShareCard.displayName = 'StunningStatsShareCard';
