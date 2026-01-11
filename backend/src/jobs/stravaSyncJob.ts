import cron from 'node-cron';
import { StravaService } from '../services/stravaService.js';

class StravaSyncJob {
  static start(): void {
    // Run every day at 6:00 PM (18:00)
    cron.schedule('0 18 * * *', async () => {
      console.log('🕐 Running scheduled Strava sync (18:00)...');
      await StravaService.syncAllAthletes();
    });

    // Run every day at 11:59 PM (23:59)
    cron.schedule('59 23 * * *', async () => {
      console.log('🕐 Running scheduled Strava sync (23:59)...');
      await StravaService.syncAllAthletes();
    });

    console.log('✅ Strava sync cron job started - will run at 18:00 and 23:59 daily');
  }
}

export default StravaSyncJob;
