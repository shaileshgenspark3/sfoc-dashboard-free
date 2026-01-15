import axios from 'axios';
import Participant from '../models/Participant.js';
import { ActivityService } from './activityService.js';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:5000/api/strava/callback';

export class StravaService {
  static getAuthUrl(participantCode: string) {
    return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=activity:read_all&state=${participantCode}`;
  }

  static async handleCallback(code: string, participantCode: string) {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;

    await Participant.findOneAndUpdate(
      { individualCode: participantCode.toUpperCase() },
      {
        stravaId: athlete.id.toString(),
        stravaAccessToken: access_token,
        stravaRefreshToken: refresh_token,
        stravaTokenExpiry: expires_at
      }
    );

    return athlete;
  }

  static async refreshAccessToken(participant: any) {
    if (Date.now() / 1000 < participant.stravaTokenExpiry - 60) {
      return participant.stravaAccessToken;
    }

    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: participant.stravaRefreshToken,
      grant_type: 'refresh_token'
    });

    const { access_token, refresh_token, expires_at } = response.data;

    participant.stravaAccessToken = access_token;
    participant.stravaRefreshToken = refresh_token;
    participant.stravaTokenExpiry = expires_at;
    await participant.save();

    return access_token;
  }

  static async syncActivities(participantCode: string) {
    const participant = await Participant.findOne({ individualCode: participantCode.toUpperCase() });
    if (!participant || !participant.stravaAccessToken) return;

    const accessToken = await this.refreshAccessToken(participant);

    // Get activities from the last 24 hours
    const after = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const response = await axios.get(`https://www.strava.com/api/v3/athlete/activities?after=${after}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const stravaActivities = response.data;
    const synced = [];

    for (const sa of stravaActivities) {
      // Map Strava types to our types
      let activityType = 'Other';
      if (sa.type === 'Run') activityType = 'Running';
      else if (sa.type === 'Walk') activityType = 'Walking';
      else if (sa.type === 'Ride') activityType = 'Cycling';
      else if (sa.type === 'Yoga') activityType = 'Yoga';
      else if (sa.type === 'WeightTraining') activityType = 'Gym';

      try {
        await ActivityService.submit({
          code: participant.individualCode,
          activityType,
          distance: sa.distance / 1000, // Strava gives meters
          duration: Math.round(sa.moving_time / 60), // Strava gives seconds
          stravaId: sa.id.toString()
        });
        synced.push(sa.id);
      } catch (err: any) {
        if (err.code === 11000 || err.message?.includes('duplicate key')) {
            console.log(`ℹ️ Activity ${sa.id} already synced. Skipping.`);
        } else {
            console.error(`Failed to sync Strava activity ${sa.id}:`, err);
        }
      }
    }

    return synced;
  }

  static async syncAllAthletes() {
    console.log('🔄 Starting bulk Strava sync for all connected athletes...');
    const participants = await Participant.find({ 
      stravaAccessToken: { $ne: null },
      isActive: true 
    });

    let totalSynced = 0;
    for (const p of participants) {
      try {
        const synced = await this.syncActivities(p.individualCode);
        totalSynced += synced?.length || 0;
      } catch (err) {
        console.error(`❌ Failed to sync Strava for ${p.individualCode}:`, err);
      }
    }
    console.log(`✅ Bulk Strava sync complete. Total activities synced: ${totalSynced}`);
    return totalSynced;
  }
}
