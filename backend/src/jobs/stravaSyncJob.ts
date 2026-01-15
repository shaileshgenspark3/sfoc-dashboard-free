import cron from 'node-cron';
import { StravaService } from '../services/stravaService.js';
import ReminderJob from './reminderJob.js';

class StravaSyncJob {
  static start(): void {
    // Run every day at 12:00 Noon (12:00)
    cron.schedule('0 12 * * *', async () => {
      console.log('🕐 Running scheduled Strava sync (12:00)...');
      await StravaService.syncAllAthletes();
      
      console.log('🔔 Strava sync complete. Triggering daily reminders...');
      await ReminderJob.checkAndSendReminders();
    });

    // Run every day at 9:00 PM (21:00)
    cron.schedule('0 21 * * *', async () => {
      console.log('🕐 Running scheduled Strava sync (21:00)...');
      await StravaService.syncAllAthletes();
    });

    console.log('✅ Strava sync cron job started - will run at 12:00 and 21:00 daily');
  }
}

export default StravaSyncJob;
