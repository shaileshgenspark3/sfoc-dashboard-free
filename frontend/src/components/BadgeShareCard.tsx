import React, { forwardRef } from 'react';
import { Participant, Badge } from '../services/api';
import { BADGE_DEFINITIONS } from '../utils/badgeDefinitions';
import { IconMap } from '../utils/iconMap';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

interface Props {
    participant: Participant;
    badge: Badge;
}

export const BadgeShareCard = forwardRef<HTMLDivElement, Props>(({ participant, badge }, ref) => {
    const def = BADGE_DEFINITIONS[badge.id] || {
        name: badge.name || 'Unknown Badge',
        description: badge.description || '',
        quote: '',
        icon: 'Trophy',
        color: 'text-gray-500'
    };

    const Icon = IconMap[def.icon] || IconMap.Trophy;
    const borderColor = def.color ? def.color.replace('text-', 'border-') : 'border-gray-500';
    const bgColor = def.color ? def.color.replace('text-', 'bg-') : 'bg-gray-500';

    return (
        <div
            ref={ref}
            className="w-[600px] h-[800px] bg-[#050505] relative overflow-hidden flex flex-col items-center justify-between p-12 border-[20px] border-[#1A1A1A]"
        >
            {/* Background Cyberpunk Grid */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-[#FF6B35]" />
            <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-[#FF6B35]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-[#FF6B35]" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-[#FF6B35]" />

            {/* Header */}
            <div className="z-10 text-center space-y-2 mt-8">
                <div className="text-[#FF6B35] font-black tracking-[0.5em] text-sm bg-black/50 px-4 py-1 inline-block border border-[#FF6B35]/30">
                    PROTOCOL: ACHIEVEMENT_UNLOCKED
                </div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    FIT-O-CHARITY
                </h1>
            </div>

            {/* Badge Visuals */}
            <div className="z-10 flex flex-col items-center flex-1 justify-center relative">
                {/* Glow Effect */}
                <div className={`absolute inset-0 ${bgColor} opacity-20 blur-[100px] rounded-full`} />

                <div className={`w-40 h-40 rounded-full bg-[#111] border-4 ${borderColor} flex items-center justify-center mb-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                    <Icon className={`w-20 h-20 ${def.color}`} />
                </div>

                <h2 className={`text-5xl font-black ${def.color} uppercase text-center tracking-tight mb-4 drop-shadow-[0_0_10px_rgba(0,0,0,1)]`}>
                    {def.name}
                </h2>

                {def.quote && (
                    <div className="max-w-md text-center">
                        <p className="text-xl text-gray-300 font-bold italic font-serif leading-relaxed">
                            "{def.quote}"
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="z-10 w-full bg-[#111] border border-[#333] p-6 flex items-center justify-between rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden border border-[#FF6B35]">
                        {participant.profilePicture ? (
                            <img src={participant.profilePicture} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#222]">
                                <span className="text-2xl font-black text-[#666]">{participant.individualCode.substring(0, 2)}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-[#FF6B35] text-xs font-bold tracking-widest uppercase">OPERATIVE</div>
                        <div className="text-2xl font-black text-white uppercase">{participant.name}</div>
                        <div className="text-gray-500 text-sm font-mono mt-1">
                            DATE: {format(new Date(), 'yyyy.MM.dd')}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-2 rounded">
                    <QRCodeSVG value={`https://www.fitocharity.site/profile/${participant.individualCode}`} size={60} />
                </div>
            </div>
        </div>
    );
});

BadgeShareCard.displayName = 'BadgeShareCard';
