import Activity, { IActivity } from '../models/Activity.js';
import Participant from '../models/Participant.js';
import { broadcastActivity } from '../websocket/socketHandler.js';
import { determineGroupCode } from '../utils/validation.js';
import { BadgeService } from './badgeService.js';

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
    stravaId?: string;
  }) {
    if (!data) {
      console.error('[ERROR] ActivityService.submit called with undefined data');
      throw new Error('Internal Server Error: Missing activity data.');
    }
    const { code, activityType, distance = 0, duration = 0, stravaId } = data; // Ignore incoming groupCode

    // 1. Find Participant
    const participant = await Participant.findOne({ individualCode: code.toUpperCase() });
    if (!participant) {
      throw new Error('Invalid participant code. Please check and try again.');
    }

    // 2. Calculate Points
    const points = calculatePoints(activityType, distance, duration);

    // 3. Determine Group Code Automatically
    const derivedGroupCode = determineGroupCode(code);

    // 4. Create Activity
    const activity = await Activity.create({
      participantCode: code.toUpperCase(),
      participantName: participant.name,
      activityType,
      distance,
      duration,
      points,
      groupCode: derivedGroupCode || participant.groupCode, // Prioritize derived, then existing
      date: new Date(),
      stravaId
    });

    // 5. Update Streak & Stats
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
    if (derivedGroupCode) {
        participant.groupCode = derivedGroupCode; // Update participant's group if derived
    }
    
    // 6. Check for new Badges
    const newBadges = await BadgeService.checkNewBadges(participant, activity);
    
    await participant.save();

    // 7. Real-time broadcast
    broadcastActivity(activity);

    return {
      activity,
      streak: newStreak,
      newBadges
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

  static async getAllDataForExport() {
    const activities = await Activity.find().sort({ createdAt: -1 }).lean();
    
    // CSV Header
    let csv = 'Date,Time,Participant Code,Name,Activity Type,Distance (KM),Duration (Min),Points,Group Code\n';

    activities.forEach((act: any) => {
      const date = new Date(act.createdAt);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      
      const line = [
        dateStr,
        timeStr,
        act.participantCode,
        `"${act.participantName}"`, // Quote name to handle commas
        act.activityType,
        act.distance || 0,
        act.duration || 0,
        act.points || 0,
        act.groupCode || 'N/A'
      ].join(',');
      
      csv += line + '\n';
    });

    return csv;
  }

  static async getAllActivities() {
    return Activity.find().sort({ createdAt: -1 });
  }

  static async deleteActivity(id: string) {
    const activity = await Activity.findById(id);
    if (!activity) throw new Error('Activity not found');

    const participant = await Participant.findOne({ individualCode: activity.participantCode });
    
    if (participant) {
      participant.totalDistance -= activity.distance;
      participant.totalDuration -= activity.duration;
      participant.totalPoints -= activity.points;
      
      // Note: Re-calculating streak is complex when deleting past activities. 
      // For simplicity, we just deduct the totals. 
      // If deleting the ONLY activity of today, we might want to check previous dates, 
      // but that requires more logic. We will accept this trade-off for now.
      
      await participant.save();
    }

    await Activity.findByIdAndDelete(id);
    return { success: true };
  }

  static async updateActivity(id: string, updates: Partial<IActivity>) {
    // 1. Get Old Activity
    const oldActivity = await Activity.findById(id);
    if (!oldActivity) throw new Error('Activity not found');

    // 2. Calculate diffs
    const distanceDiff = (updates.distance || 0) - oldActivity.distance;
    const durationDiff = (updates.duration || 0) - oldActivity.duration;
    
    // 3. Recalculate points if needed
    let newPoints = oldActivity.points;
    if (updates.distance !== undefined || updates.duration !== undefined || updates.activityType) {
      newPoints = calculatePoints(
        updates.activityType || oldActivity.activityType,
        updates.distance !== undefined ? updates.distance : oldActivity.distance,
        updates.duration !== undefined ? updates.duration : oldActivity.duration
      );
    }
    const pointsDiff = newPoints - oldActivity.points;

    // 4. Update Participant
    const participant = await Participant.findOne({ individualCode: oldActivity.participantCode });
    if (participant) {
      participant.totalDistance += distanceDiff;
      participant.totalDuration += durationDiff;
      participant.totalPoints += pointsDiff;
      await participant.save();
    }

    // 5. Update Activity
    const updatedActivity = await Activity.findByIdAndUpdate(id, {
      ...updates,
      points: newPoints
    }, { new: true });

    return updatedActivity;
  }
}
