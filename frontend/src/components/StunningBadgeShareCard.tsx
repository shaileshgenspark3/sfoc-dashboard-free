import React, { forwardRef } from 'react';
import { Participant, Badge } from '../services/api';
import { BADGE_DEFINITIONS } from '../utils/badgeDefinitions';
import { IconMap } from '../utils/iconMap';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Quote } from '../utils/quotes';

interface Props {
    participant: Participant;
    badge: Badge;
    quote: Quote;
}

export const StunningBadgeShareCard = forwardRef<HTMLDivElement, Props>(({ participant, badge, quote }, ref) => {
    const def = BADGE_DEFINITIONS.find(d => d.id === badge.id) || {
        name: badge.name || 'Unknown Badge',
        description: badge.description || '',
        icon: 'Trophy',
        color: 'text-gray-500'
    } as any;

    const Icon = IconMap[def.icon] || IconMap.Trophy;

    // Extract color class logic (assuming Tailwind classes like 'text-neon-green', 'text-blue-500')
    // We'll map these to specific hex codes for more control in inline styles if needed, 
    // or just rely on the extensive Tailwind palette.
    const textColor = def.color || 'text-white';
    const glowColor = def.color?.replace('text-', 'bg-') || 'bg-white';
    const borderColor = def.color?.replace('text-', 'border-') || 'border-white';

    return (
        <div
            ref={ref}
            className="w-[1080px] h-[1920px] bg-[#000] relative overflow-hidden flex flex-col items-center justify-between text-white font-sans selection:bg-none"
        >
            {/* --- Background Elements --- */}

            {/* Grainy Noise Overlay */}
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Gradient Ambient Light */}
            <div className={`absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-transparent via-transparent to-${glowColor.replace('bg-', '')}/10 z-0`} />
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-black via-black/50 to-transparent z-0" />
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-0" />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            />

            {/* --- Content Components --- */}

            {/* 1. Header Protocol Line */}
            <div className="z-10 w-full pt-20 px-12 flex justify-between items-center opacity-80">
                <div className="flex items-center gap-4">
                    <div className={`h-2 w-20 ${glowColor}`} />
                    <span className="text-2xl font-mono uppercase tracking-[0.3em] text-gray-400">Protocol: Unlocked</span>
                </div>
                <span className="text-2xl font-mono text-gray-600 tracking-widest">{format(new Date(), 'yyyy.MM.dd // HH:mm')}</span>
            </div>

            {/* 2. Main Badge Display */}
            <div className="z-10 flex flex-col items-center justify-center flex-1 w-full px-12 relative">

                {/* Glowing Aura Behind Badge */}
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${glowColor} rounded-full blur-[150px] opacity-20`} />

                {/* Icon Container */}
                <div className="relative mb-16">
                    <div className={`w-64 h-64 rounded-3xl bg-black/40 backdrop-blur-xl border-2 ${borderColor} flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.6)] rotate-3`}>
                        <div className="absolute inset-0 border border-white/10 rounded-3xl" /> {/* Inner Border */}
                        <Icon className={`w-32 h-32 ${textColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
                    </div>
                </div>

                {/* Badge Title */}
                <h1 className={`text-8xl font-black uppercase tracking-tighter text-center mb-6 leading-none drop-shadow-2xl ${textColor} italic`}>
                    {def.name}
                </h1>

                {/* Badge Description */}
                <p className="text-3xl text-gray-400 font-light text-center max-w-4xl leading-relaxed tracking-wide">
                    {def.description}
                </p>

                <div className="w-32 h-1 bg-gray-800 mt-12 mb-12" />

                {/* Quote Section */}
                <div className="max-w-4xl text-center relative">
                    <span className="absolute -top-12 -left-8 text-8xl font-serif text-gray-800">“</span>
                    <p className="text-5xl font-serif font-medium italic text-gray-200 leading-tight mb-8">
                        {quote.text}
                    </p>
                    <p className="text-2xl font-bold text-gray-500 uppercase tracking-widest">— {quote.author}</p>
                </div>

            </div>

            {/* 3. Footer Context Section */}
            <div className="z-10 w-full bg-[#0A0A0A] border-t border-gray-800 p-12">
                <div className="flex items-center justify-between">

                    {/* Left: User Profile & Context */}
                    <div className="flex items-center gap-8">
                        <div className={`w-24 h-24 rounded-full border-2 ${borderColor} p-1`}>
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                                {participant.profilePicture ? (
                                    <img src={participant.profilePicture} className="w-full h-full object-cover grayscale" alt={participant.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500 font-black text-2xl">
                                        {participant.individualCode.substring(0, 2)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-4xl font-black text-white uppercase tracking-tight">{participant.name}</h3>
                                <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-bold uppercase tracking-wider">Operative</span>
                            </div>
                            <div className="text-xl text-gray-500 font-medium flex flex-col">
                                <span>Just levelled up on <strong className="text-white">Fit-O-Charity</strong>.</span>
                                <span className="text-sm opacity-60 uppercase tracking-wider mt-1">Fitness for a Cause // Make Every Step Count</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: CTA & QR */}
                    <div className="flex items-center gap-8 bg-white/5 pr-8 rounded-2xl border border-white/5">
                        <div className="bg-white p-3 h-full rounded-l-xl">
                            <QRCodeSVG
                                value="https://www.fitocharity.site"
                                size={100}
                                level="Q"
                            />
                        </div>
                        <div className="py-4">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Join the Movement</p>
                            <p className="text-2xl font-black text-white tracking-widest">FIT-O-CHARITY</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
});

StunningBadgeShareCard.displayName = 'StunningBadgeShareCard';
