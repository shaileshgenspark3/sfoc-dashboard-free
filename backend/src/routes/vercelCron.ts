import express from 'express';
import { sendDailyReminders } from '../jobs/reminderJob.js';

const router = express.Router();

// Protected by Vercel Cron header (optional but recommended)
router.get('/reminders', async (req, res) => {
  try {
    console.log('⏰ Triggering Scheduled Reminders via Vercel Cron...');
    await sendDailyReminders();
    res.status(200).json({ success: true, message: 'Reminders triggered' });
  } catch (error) {
    console.error('Cron Error:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger reminders' });
  }
});

export default router;
