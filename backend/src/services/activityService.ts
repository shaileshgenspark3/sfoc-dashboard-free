import Activity, { IActivity } from '../models/Activity.js';
import Participant from '../models/Participant.js';
import { broadcastActivity } from '../websocket/socketHandler.js';

const calculatePoints = (type: string, distance: number, duration: number): number => {
  const activityType = type.toLowerCase();
  let points = 0;

  if (['walking', 'running', 'cycling'].includes(activityType)) {
    // 10 points per 1 KM
    points = distance * 10;
  } else if (activityType === 'yoga') {
    // 20 points per 30 minutes => 20/30 per minute
    points = duration * (20 / 30);
  } else if (activityType === 'gym') {
    // 25 points per 60 minutes => 25/60 per minute
    points = duration * (25 / 60);
  } else {
    // Default fallback or 'Other'
    points = distance * 5; // Placeholder for other
  }

  return Math.round(points * 100) / 100; // Keep 2 decimal places
};

export class ActivityService {
  static async submit(data: {
    code: string;
    activityType: string;
    distance?: number;
    duration?: number;
    groupCode?: string;
  }) {
    if (!data) {
      console.error('[ERROR] ActivityService.submit called with undefined data');
      throw new Error('Internal Server Error: Missing activity data.');
    }
    const { code, activityType, distance = 0, duration = 0, groupCode } = data;

    // 1. Find Participant
    const participant = await Participant.findOne({ individualCode: code.toUpperCase() });
    if (!participant) {
      throw new Error('Invalid participant code. Please check and try again.');
    }

    // 2. Calculate Points
    const points = calculatePoints(activityType, distance, duration);

    // 3. Create Activity
    const activity = await Activity.create({
      participantCode: code.toUpperCase(),
      participantName: participant.name,
      activityType,
      distance,
      duration,
      points,
      groupCode: groupCode?.toUpperCase() || participant.groupCode,
      date: new Date()
    });

    // 4. Update Streak & Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivityDate = participant.lastActivityDate 
      ? new Date(participant.lastActivityDate) 
      : null;
    
    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0);
    }

    let newStreak = participant.streakDays;
    
    if (!lastActivityDate) {
      newStreak = 1;
    } else {
      const diffTime = today.getTime() - lastActivityDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Streak broken
      }
      // If diffDays === 0, streak remains same (already submitted today)
    }

    participant.totalDistance += distance;
    participant.totalDuration += duration;
    participant.totalPoints += points;
    participant.streakDays = newStreak;
    participant.lastActivityDate = new Date();
    await participant.save();

    // 5. Real-time broadcast
    broadcastActivity(activity);

    return {
      activity,
      streak: newStreak
    };
  }

  static async getToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return Activity.find({ createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });
  }

  static async getStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalParticipants, todayActivitiesCount, allActivities] = await Promise.all([
      Participant.countDocuments(),
      Activity.countDocuments({ createdAt: { $gte: startOfDay } }),
      Activity.find().select('distance duration points activityType')
    ]);

    const totalDistance = allActivities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    const totalDuration = allActivities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    
    // Recalculate points for old activities if they don't have it, or use stored points
    const totalPoints = allActivities.reduce((acc, curr) => {
      if (curr.points !== undefined && curr.points !== 0) {
        return acc + curr.points;
      }
      // Fallback for older data without points field
      return acc + calculatePoints(curr.activityType, curr.distance || 0, curr.duration || 0);
    }, 0);

    const totalCharity = Math.round(totalPoints * 10); // 10 Rs per point

    return {
      totalParticipants,
      todayActivities: todayActivitiesCount,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDuration,
      totalPoints: Math.round(totalPoints),
      totalCharity
    };
  }

  static async getByParticipant(code: string) {
    return Activity.find({ participantCode: code.toUpperCase() }).sort({ createdAt: -1 });
  }
}
