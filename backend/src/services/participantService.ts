import Participant, { IParticipant } from '../models/Participant.js';
import { generateCode } from '../utils/codeGenerator.js';
import EmailService from './emailService.js';
import WhatsAppService from './whatsappService.js';

export class ParticipantService {
  static async register(data: {
    name: string;
    email: string;
    mobile: string;
    activityType: string;
    groupCode?: string;
  }) {
    const { name, email, mobile, activityType, groupCode } = data;

    // 1. Check if email already exists
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant) {
      throw new Error('This email is already registered. Use your unique code to log in.');
    }

    // 2. Generate unique individual code
    let individualCode = '';
    let isUnique = false;
    while (!isUnique) {
      individualCode = generateCode(6);
      const existing = await Participant.findOne({ individualCode });
      if (!existing) isUnique = true;
    }

    // 3. Create Participant
    const participant = await Participant.create({
      name,
      email,
      mobile,
      activityType,
      individualCode,
      groupCode: groupCode || null
    });

    // 4. Send welcome messages (Background - don't wait)
    EmailService.sendWelcomeEmail(participant).catch(err => console.error('Email failed:', err));
    WhatsAppService.sendWelcomeMessage(participant).catch(err => console.error('WhatsApp failed:', err));

    return participant;
  }

  static async bulkImport(records: any[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const record of records) {
      try {
        // Basic normalization
        const name = record.name || record.Name;
        const email = (record.email || record.Email)?.toLowerCase().trim();
        const mobile = record.mobile || record.Mobile || record.Phone || record.phone;
        const activityType = record.activityType || record.Activity || 'Walking';

        if (!name || !email || !mobile) {
          throw new Error(`Missing required fields for ${name || 'unknown'}`);
        }

        // Check duplicate
        const existing = await Participant.findOne({ email });
        if (existing) {
          throw new Error(`Email ${email} already registered`);
        }

        // Generate Code
        let individualCode = '';
        let isUnique = false;
        while (!isUnique) {
          individualCode = generateCode(6);
          const exists = await Participant.findOne({ individualCode });
          if (!exists) isUnique = true;
        }

        await Participant.create({
          name,
          email,
          mobile,
          activityType,
          individualCode,
          isActive: true
        });

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(err.message);
      }
    }

    return results;
  }

  static async getByCode(code: string) {
    const participant = await Participant.findOne({ 
      individualCode: code.toUpperCase() 
    });
    if (!participant) throw new Error('Invalid participant code.');
    return participant;
  }

  static async getLeaderboard(limit = 20) {
    return Participant.find({ isActive: true })
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('name individualCode totalDistance totalDuration totalPoints streakDays');
  }

  static async getAll() {
    return Participant.find({ isActive: true }).sort({ totalPoints: -1 });
  }
}
