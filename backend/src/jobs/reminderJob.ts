import cron from 'node-cron';
import Participant from '../models/Participant.js';
import Activity from '../models/Activity.js';
import WhatsAppService from '../services/whatsappService.js';
import EmailService from '../services/emailService.js';

class ReminderJob {
  static start(): void {
    // Run every day at 6:00 PM IST (18:00)
    // Adjust timezone as needed
    cron.schedule('0 18 * * *', async () => {
      console.log('🕐 Running daily reminder check...');
      await this.checkAndSendReminders();
    });

    console.log('✅ Reminder cron job started - will run daily at 6:00 PM');
  }

  static async checkAndSendReminders() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all active participants
      const participants = await Participant.find({ isActive: true });

      let remindersSent = 0;
      let whatsappSent = 0;
      let emailSent = 0;

      for (const participant of participants) {
        // Check if participant has submitted any activity today
        const hasActivityToday = await Activity.findOne({
          participantCode: participant.individualCode,
          date: { $gte: today, $lt: tomorrow }
        });

        if (!hasActivityToday) {
          const activityUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/submit`;

          // Send WhatsApp reminder
          const whatsappResult = await WhatsAppService.sendReminder(participant, activityUrl);
          if (whatsappResult.success) {
            whatsappSent++;
          }

          // Send Email reminder
          const emailResult = await EmailService.sendReminder(participant, activityUrl);
          if (emailResult.success) {
            emailSent++;
          }

          remindersSent++;

          // Small delay between sends to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`📊 Reminder Summary:
        - Total participants checked: ${participants.length}
        - Reminders sent: ${remindersSent}
        - WhatsApp messages: ${whatsappSent}
        - Emails sent: ${emailSent}
      `);

      return { remindersSent, whatsappSent, emailSent };
    } catch (error) {
      console.error('❌ Error in reminder job:', (error as Error).message);
      throw error;
    }
  }

  // Manual trigger function
  static async manualTrigger() {
    console.log('🔔 Manual reminder trigger initiated...');
    return await this.checkAndSendReminders();
  }
}

export default ReminderJob;
