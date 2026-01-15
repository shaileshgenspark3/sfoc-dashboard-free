import React from 'react';
import { Badge } from '../services/api';
import { BADGE_DEFINITIONS } from '../utils/badgeDefinitions';
import { IconMap } from '../utils/iconMap';
import { motion } from 'framer-motion';

interface Props {
  earnedBadges: Badge[];
}

export const BadgesList: React.FC<Props> = ({ earnedBadges }) => {
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {BADGE_DEFINITIONS.map((def, index) => {
        const isUnlocked = earnedIds.has(def.id);
        const Icon = IconMap[def.icon] || IconMap.Trophy;

        return (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-xl border ${
              isUnlocked 
                ? 'bg-gray-800/50 border-neon-green/30' 
                : 'bg-gray-900/50 border-gray-800'
            } backdrop-blur-sm flex flex-col items-center text-center group overflow-hidden`}
          >
            {/* Locked Overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="bg-black/50 p-2 rounded-full border border-gray-700">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            )}

            <div className={`p-3 rounded-full mb-3 ${
              isUnlocked ? 'bg-gray-800' : 'bg-gray-900 grayscale opacity-50'
            }`}>
              <Icon className={`w-8 h-8 ${isUnlocked ? def.color : 'text-gray-500'}`} />
            </div>
            
            <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
              {def.name}
            </h4>
            
            <p className="text-xs text-gray-400 line-clamp-2">
              {def.description}
            </p>

            {isUnlocked && (
               <div className="absolute inset-0 border-2 border-neon-green/0 group-hover:border-neon-green/20 rounded-xl transition-colors pointer-events-none" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
