import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { IParticipant } from '../models/Participant.js';

dotenv.config();

// Create transporter - Using Gmail SMTP (free)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class EmailService {
  static async sendReminder(participant: IParticipant, activityUrl: string) {
    const mailOptions = {
      from: `"FIT-O-CHARITY" <${process.env.EMAIL_FROM || 'noreply@sukrutparivar.com'}>`,
      to: participant.email,
      subject: '⏰ Daily Activity Reminder - FIT-O-CHARITY',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); padding: 20px; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #FF6B35; }
            .message { font-size: 18px; color: #ccc; line-height: 1.6; margin-bottom: 20px; }
            .button { display: inline-block; padding: 16px 32px; background: #FF6B35; color: black; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { color: #FF6B35; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏆 FIT-O-CHARITY</div>
              <p style="color: #888; font-size: 12px; margin-top: 5px;">by Sukrut Parivar Charitable Trust</p>
            </div>
            <div class="message">
              <p>Hey <span class="highlight">${participant.name}</span>! 👋</p>
              <p>⏰ <strong>Reminder:</strong> Don't forget to submit your today's activity!</p>
              <p>Every activity counts towards our mission of fitness and charity!</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activityUrl}" class="button">📝 SUBMIT ACTIVITY NOW</a>
            </div>
            <div class="footer">
              <p>💪 Stay Fit, Support the Cause!</p>
              <p>FIT-O-CHARITY | Sukrut Parivar Charitable Trust</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${participant.name}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Email failed for ${participant.name}:`, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  static async sendWelcomeEmail(participant: IParticipant) {
    const mailOptions = {
      from: `"FIT-O-CHARITY" <${process.env.EMAIL_FROM || 'noreply@sukrutparivar.com'}>`,
      to: participant.email,
      subject: '🎉 Welcome to FIT-O-CHARITY!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050505; padding: 20px; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; background: #0d0d0d; border-radius: 16px; padding: 40px; border: 2px solid #1a1a1a; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #FF6B35; }
            .code-box { background: #FF6B35; color: black; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0; font-size: 32px; font-weight: 900; letter-spacing: 8px; }
            .message { font-size: 16px; color: #ccc; line-height: 1.6; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏆 FIT-O-CHARITY</div>
              <p>by Sukrut Parivar Charitable Trust</p>
            </div>
            <div class="message">
              <p>Welcome aboard, <strong>${participant.name}</strong>! 🎉</p>
              <p>We're thrilled to have you join our fitness movement for a better cause!</p>
              <p>Your Unique Identification Code:</p>
              <div class="code-box">${participant.individualCode}</div>
              <p>Keep this code safe. Use it daily to log your performance and climb the ranks!</p>
            </div>
            <div class="footer">
              <p>📅 Let's transform fitness into charity!</p>
              <p>💪 Mission Initiated.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Welcome email failed for ${participant.name}:`, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  static async sendAchievementEmail(participant: IParticipant, achievement: string) {
    const mailOptions = {
      from: `"FIT-O-CHARITY" <${process.env.EMAIL_FROM || 'noreply@sukrutparivar.com'}>`,
      to: participant.email,
      subject: '🏆 Protocol Achievement Unlocked!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050505; padding: 20px; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; background: #0d0d0d; border-radius: 16px; padding: 40px; border: 2px solid #1a1a1a; }
            .header { text-align: center; margin-bottom: 30px; }
            .trophy { font-size: 60px; margin-bottom: 10px; }
            .achievement { background: #FF6B35; color: black; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0; font-weight: bold; }
            .message { font-size: 16px; color: #ccc; line-height: 1.6; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="trophy">🏆</div>
              <h2 style="color: #FF6B35;">RANK_ACHIEVEMENT_UNLOCKED</h2>
            </div>
            <div class="message">
              <p>Congratulations Operative <strong>${participant.name}</strong>!</p>
              <div class="achievement">
                <h3>${achievement}</h3>
              </div>
              <p>You are setting new standards for the mission! 🌟</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Achievement email failed for ${participant.name}:`, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }
}

export default EmailService;