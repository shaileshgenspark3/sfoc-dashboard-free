import express from 'express';
import ReminderJob from '../jobs/reminderJob.js';
import { cronAuth } from '../middleware/cronAuth.js';

const router = express.Router();

// Protected by authentication token
router.get('/reminders', cronAuth, async (req, res) => {
  try {
    console.log('⏰ Triggering Scheduled Reminders via External Cron...');
    const result = await ReminderJob.checkAndSendReminders();
    res.status(200).json({
      success: true,
      message: 'Reminders triggered',
      data: result
    });
  } catch (error) {
    console.error('Cron Error:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger reminders' });
  }
});

export default router;
