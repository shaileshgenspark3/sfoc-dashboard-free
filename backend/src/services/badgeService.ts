import { IParticipant } from '../models/Participant.js';
import { IActivity } from '../models/Activity.js';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class or hex
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  first_step: { 
    id: 'first_step', 
    name: 'First Step', 
    description: 'Logged your first activity! The journey of a thousand miles begins here.', 
    icon: 'Footprints',
    color: 'text-blue-500'
  },
  night_owl: { 
    id: 'night_owl', 
    name: 'Night Owl', 
    description: 'Logged an activity after 10 PM. The city sleeps, but you don\'t.', 
    icon: 'Moon',
    color: 'text-indigo-400'
  },
  early_bird: { 
    id: 'early_bird', 
    name: 'Early Bird', 
    description: 'Logged an activity before 7 AM. Rising with the sun!', 
    icon: 'Sun',
    color: 'text-yellow-400'
  },
  consistency_king: { 
    id: 'consistency_king', 
    name: 'Consistency King', 
    description: 'Maintained a 7-day streak. Unstoppable momentum.', 
    icon: 'Flame',
    color: 'text-orange-500'
  },
  weekend_warrior: { 
    id: 'weekend_warrior', 
    name: 'Weekend Warrior', 
    description: 'Logged an activity on Saturday or Sunday. No days off.', 
    icon: 'Sword',
    color: 'text-red-500'
  },
  half_century: { 
    id: 'half_century', 
    name: 'Half Century', 
    description: 'Reached 50km total distance. Halfway to glory.', 
    icon: 'Medal',
    color: 'text-teal-400'
  },
  century_club: { 
    id: 'century_club', 
    name: 'Century Club', 
    description: 'Reached 100km total distance. Welcome to the elite.', 
    icon: 'Trophy',
    color: 'text-amber-400'
  },
  iron_will: { 
    id: 'iron_will', 
    name: 'Iron Will', 
    description: 'Clocked over 1000 minutes of activity. Pure dedication.', 
    icon: 'Dumbbell',
    color: 'text-gray-300'
  },
  marathoner: { 
    id: 'marathoner', 
    name: 'Marathoner', 
    description: 'Completed a single activity over 21km. Endurance master.', 
    icon: 'Route',
    color: 'text-green-500'
  }
};

export class BadgeService {
  /**
   * Checks for newly unlocked badges based on the participant's stats and the latest activity.
   * Returns an array of newly unlocked badge objects (including definitions).
   */
  static async checkNewBadges(participant: IParticipant, activity: IActivity) {
    const newBadges: BadgeDefinition[] = [];
    const existingIds = new Set(participant.badges.map(b => b.id));

    const unlock = (id: string) => {
      if (!existingIds.has(id)) {
        const def = BADGE_DEFINITIONS[id];
        if (def) {
          newBadges.push(def);
          participant.badges.push({ id, unlockedAt: new Date() });
          existingIds.add(id);
        }
      }
    };

    // 1. First Step
    if (participant.totalDistance > 0 || participant.totalDuration > 0) {
      unlock('first_step');
    }

    // 2. Time-based (check activity date)
    const actDate = new Date(activity.date);
    const hour = actDate.getHours();
    const day = actDate.getDay(); // 0 = Sun, 6 = Sat

    if (hour >= 22) unlock('night_owl');
    if (hour < 7) unlock('early_bird');
    if (day === 0 || day === 6) unlock('weekend_warrior');

    // 3. Stats-based
    if (participant.streakDays >= 7) unlock('consistency_king');
    if (participant.totalDistance >= 50) unlock('half_century');
    if (participant.totalDistance >= 100) unlock('century_club');
    if (participant.totalDuration >= 1000) unlock('iron_will');

    // 4. Activity Specific
    // Ensure we handle units correctly. Activity.distance is in KM.
    if (activity.distance >= 21) unlock('marathoner');

    // Save if we found new badges
    if (newBadges.length > 0) {
      await participant.save();
    }

    return newBadges;
  }

  static getAllBadges() {
    return Object.values(BADGE_DEFINITIONS);
  }

  static getParticipantBadges(participant: IParticipant) {
    return participant.badges.map(b => ({
      ...b,
      ...BADGE_DEFINITIONS[b.id]
    }));
  }
}
