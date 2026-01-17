import { IParticipant } from '../models/Participant.js';
import { IActivity } from '../models/Activity.js';
import { startOfDay, endOfDay } from 'date-fns';
import Activity from '../models/Activity.js';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  quote?: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class or hex
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  // --- EXISTING BADGES (Retained) ---
  first_step: {
    id: 'first_step',
    name: 'Initiation Protocol',
    description: 'Logged your first activity.',
    quote: 'The journey of a thousand miles begins with a single step.',
    icon: 'Footprints',
    color: 'text-blue-500'
  },
  night_owl: {
    id: 'night_owl',
    name: 'Nightstalker',
    description: 'Activity logged after 10 PM.',
    quote: 'While they sleep, we grind.',
    icon: 'Moon',
    color: 'text-indigo-400'
  },
  early_bird: {
    id: 'early_bird',
    name: 'Dawn Breaker',
    description: 'Activity logged before 7 AM.',
    quote: 'Victory belongs to the early riser.',
    icon: 'Sun',
    color: 'text-yellow-400'
  },
  consistency_king: {
    id: 'consistency_king',
    name: 'System Consistent',
    description: '7-day active streak.',
    quote: 'Success is the sum of small efforts, repeated.',
    icon: 'Flame',
    color: 'text-orange-500'
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warfare',
    description: 'Activity on Saturday or Sunday.',
    quote: 'No days off. No excuses.',
    icon: 'Sword',
    color: 'text-red-500'
  },
  half_century: {
    id: 'half_century',
    name: '50KM Milestone',
    description: 'Total distance reached 50km.',
    quote: 'Halfway to greatness.',
    icon: 'Medal',
    color: 'text-teal-400'
  },
  century_club: {
    id: 'century_club',
    name: 'Centurion Grade',
    description: 'Total distance reached 100km.',
    quote: 'Welcome to the elite.',
    icon: 'Trophy',
    color: 'text-amber-400'
  },
  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    description: '1000+ minutes of total activity.',
    quote: 'Pain is temporary. Glory is forever.',
    icon: 'Dumbbell',
    color: 'text-gray-300'
  },
  marathoner: {
    id: 'marathoner',
    name: 'Endurance Titan',
    description: 'Single activity over 21km.',
    quote: 'The only limit is the one you set yourself.',
    icon: 'Route',
    color: 'text-green-500'
  },

  // --- NEW DAILY TARGET BADGES ---
  daily_5k: {
    id: 'daily_5k',
    name: 'Daily 5K Operator',
    description: 'Covered 5km in a single day (Walk/Run/Cycle).',
    quote: 'Movement is life.',
    icon: 'PersonStanding',
    color: 'text-cyan-400'
  },
  daily_10k: {
    id: 'daily_10k',
    name: '10K Spec Ops',
    description: 'Covered 10km in a single day (Walk/Run/Cycle).',
    quote: 'Distance is just a number.',
    icon: 'Map',
    color: 'text-purple-500'
  },
  yoga_30: {
    id: 'yoga_30',
    name: 'Mindfulness Initiate',
    description: '30 minutes of Yoga in a day.',
    quote: 'Quiet the mind, and the soul will speak.',
    icon: 'Flower2',
    color: 'text-rose-300'
  },
  yoga_60: {
    id: 'yoga_60',
    name: 'Zen Master',
    description: '60 minutes of Yoga in a day.',
    quote: 'In the midst of movement and chaos, keep stillness inside of you.',
    icon: 'Brain',
    color: 'text-rose-500'
  },
  gym_60: {
    id: 'gym_60',
    name: 'Iron Pumper',
    description: '60 minutes of Gym in a day.',
    quote: 'Suffer now and live the rest of your life as a champion.',
    icon: 'BicepsFlexed',
    color: 'text-gray-400'
  },
  gym_90: {
    id: 'gym_90',
    name: 'Heavy Lifter',
    description: '90 minutes of Gym in a day.',
    quote: 'Light weight, baby!',
    icon: 'Weight',
    color: 'text-slate-300'
  },
  gym_120: {
    id: 'gym_120',
    name: 'Titan Strength',
    description: '120 minutes of Gym in a day.',
    quote: 'The body achieves what the mind believes.',
    icon: 'Crown',
    color: 'text-amber-500'
  },

  // --- NEW MILESTONE BADGES ---
  streak_14: {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: '14-day active streak.',
    quote: 'Consistency is the DNA of mastery.',
    icon: 'Flame',
    color: 'text-orange-600'
  },
  streak_30: {
    id: 'streak_30',
    name: 'Monthly Mauler',
    description: '30-day active streak.',
    quote: 'You do not decided your future. You decide your habits.',
    icon: 'CalendarCheck',
    color: 'text-red-600'
  },
  dist_250: {
    id: 'dist_250',
    name: 'Road Warrior',
    description: '250km total distance.',
    quote: 'The road goes on forever and the party never ends.',
    icon: 'Truck',
    color: 'text-blue-600'
  },
  dist_500: {
    id: 'dist_500',
    name: 'Globe Trotter',
    description: '500km total distance.',
    quote: 'A journey of a thousand miles begins with a single step.',
    icon: 'Globe2',
    color: 'text-indigo-600'
  },
  dur_2500: {
    id: 'dur_2500',
    name: 'Time Lord',
    description: '2500 minutes of activity.',
    quote: 'Time is the most valuable thing a man can spend.',
    icon: 'Hourglass',
    color: 'text-violet-400'
  },
  dur_5000: {
    id: 'dur_5000',
    name: 'Chronos Avatar',
    description: '5000 minutes of activity.',
    quote: 'Lost time is never found again.',
    icon: 'Watch',
    color: 'text-purple-600'
  }
};

export class BadgeService {
  /**
   * Checks for newly unlocked badges based on the participant's stats and the latest activity.
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

    // --- 1. Basic & Milestones ---
    if (participant.totalDistance > 0 || participant.totalDuration > 0) unlock('first_step');

    // Streaks
    if (participant.streakDays >= 7) unlock('consistency_king');
    if (participant.streakDays >= 14) unlock('streak_14');
    if (participant.streakDays >= 30) unlock('streak_30');

    // Distance Totals
    if (participant.totalDistance >= 50) unlock('half_century');
    if (participant.totalDistance >= 100) unlock('century_club');
    if (participant.totalDistance >= 250) unlock('dist_250');
    if (participant.totalDistance >= 500) unlock('dist_500');

    // Duration Totals
    if (participant.totalDuration >= 1000) unlock('iron_will');
    if (participant.totalDuration >= 2500) unlock('dur_2500');
    if (participant.totalDuration >= 5000) unlock('dur_5000');

    // --- 2. Time-based ---
    const actDate = new Date(activity.date);
    const hour = actDate.getHours();
    const day = actDate.getDay();

    if (hour >= 22) unlock('night_owl');
    if (hour < 7) unlock('early_bird');
    if (day === 0 || day === 6) unlock('weekend_warrior');

    // --- 3. Single Activity ---
    if (activity.distance >= 21) unlock('marathoner');

    // --- 4. Daily Aggregates (Requires DB Query) ---
    // Fetch all activities for this participant for TODAY to sum up
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());

    const todayActivities = await Activity.find({
      participantCode: participant.individualCode,
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate Daily Totals
    const dailyDistance = todayActivities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    const dailyYogaMins = todayActivities
      .filter(a => a.activityType === 'Yoga')
      .reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const dailyGymMins = todayActivities
      .filter(a => a.activityType === 'Gym')
      .reduce((acc, curr) => acc + (curr.duration || 0), 0);

    // Distance Targets (Walk/Run/Cycle)
    if (dailyDistance >= 5) unlock('daily_5k');
    if (dailyDistance >= 10) unlock('daily_10k');

    // Yoga Targets
    if (dailyYogaMins >= 30) unlock('yoga_30');
    if (dailyYogaMins >= 60) unlock('yoga_60');

    // Gym Targets
    if (dailyGymMins >= 60) unlock('gym_60');
    if (dailyGymMins >= 90) unlock('gym_90');
    if (dailyGymMins >= 120) unlock('gym_120');

    // Save if new badges found
    if (newBadges.length > 0) {
      await participant.save();
    }

    return newBadges;
  }

  static getAllBadges() {
    return Object.values(BADGE_DEFINITIONS);
  }

  static getParticipantBadges(participant: IParticipant) {
    return participant.badges.map(b => {
      const badgeData = (b as any).toObject ? (b as any).toObject() : b;
      const def = BADGE_DEFINITIONS[b.id] || {
        name: 'Unknown Badge',
        description: 'Badge definition not found',
        quote: '',
        icon: 'HelpCircle',
        color: 'text-gray-500'
      };
      return {
        ...badgeData,
        ...def
      };
    });
  }
}
