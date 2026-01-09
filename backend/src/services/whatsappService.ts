import twilio, { Twilio } from 'twilio';
import dotenv from 'dotenv';
import { IParticipant } from '../models/Participant.js';

dotenv.config();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client: Twilio | null = null;

// Only initialize Twilio if credentials are provided
if (accountSid && authToken && accountSid !== 'your_twilio_account_sid') {
  client = twilio(accountSid, authToken);
}

class WhatsAppService {
  static async sendReminder(participant: IParticipant, activityUrl: string) {
    if (!client) {
      console.log('⚠️ Twilio not configured. WhatsApp message would be sent to:', participant.mobile);
      return { success: false, error: 'Twilio not configured' };
    }

    const message = `🏃‍♂️ Hey ${participant.name}! 

⏰ Reminder: Don't forget to log your performance for FIT-O-CHARITY today!

📍 UPLINK: ${activityUrl}

💪 Stay fit for the cause!
Sukrut Parivar Charitable Trust`;

    try {
      const result = await client.messages.create({
        body: message,
        from: twilioWhatsappNumber,
        to: `whatsapp:${participant.mobile}`
      });

      console.log(`✅ WhatsApp sent to ${participant.name}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error(`❌ WhatsApp failed for ${participant.name}:`, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  static async sendWelcomeMessage(participant: IParticipant) {
    if (!client) {
      console.log('⚠️ Twilio not configured. Welcome WhatsApp would be sent to:', participant.mobile);
      return { success: false, error: 'Twilio not configured' };
    }

    const message = `🎉 Welcome to FIT-O-CHARITY, ${participant.name}!

Your mission code: *${participant.individualCode}*

🏆 Log activities daily to help Sukrut Parivar make a difference!

📱 UPLINK PORTAL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

💪 Mission Initiated. Let's move!`;

    try {
      const result = await client.messages.create({
        body: message,
        from: twilioWhatsappNumber,
        to: `whatsapp:${participant.mobile}`
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error(`❌ Welcome WhatsApp failed for ${participant.name}:`, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  static async sendAchievementNotification(participant: IParticipant, achievement: string) {
    if (!client) {
      console.log('⚠️ Twilio not configured. Achievement WhatsApp would be sent to:', participant.mobile);
      return { success: false, error: 'Twilio not configured' };
    }

    const message = `🏆 Bravo, ${participant.name}!

PROTOCOL_ACHIEVEMENT: ${achievement}

Your performance is outstanding! Keep it up for FIT-O-CHARITY. 💪🔥`;

    try {
      const result = await client.messages.create({
        body: message,
        from: twilioWhatsappNumber,
        to: `whatsapp:${participant.mobile}`
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error(`❌ Achievement WhatsApp failed for ${participant.name}:`, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }
}

export default WhatsAppService;