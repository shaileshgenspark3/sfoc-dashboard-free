import Participant, { IParticipant } from '../models/Participant.js';
import { generateCode } from '../utils/codeGenerator.js';
import EmailService from './emailService.js';
import WhatsAppService from './whatsappService.js';
import { BadgeService } from './badgeService.js';

import Group from '../models/Group.js';

// Helper to determine group from code
const determineGroupCode = (code: string): string | null => {
  const codeNum = parseInt(code);
  if (!isNaN(codeNum)) {
    // 1-999: SQUAD_1 to SQUAD_50 (20 users per squad)
    if (codeNum >= 1 && codeNum <= 999) {
      const squadNum = Math.ceil(codeNum / 20);
      return `SQUAD_${squadNum}`;
    }
    // Existing ranges
    if (codeNum >= 1000 && codeNum < 2000) return '1000';
    if (codeNum >= 2000 && codeNum < 3000) return '2000';
    if (codeNum >= 3000 && codeNum < 4000) return '3000';
    if (codeNum >= 4000 && codeNum < 5000) return '4000';
    if (codeNum >= 5000 && codeNum < 6000) return '5000';
  }
  return null;
};

// Helper to ensure auto-assigned groups exist
const ensureGroupExists = async (groupCode: string) => {
  try {
    const existing = await Group.findOne({ groupCode });
    if (!existing) {
      // Create default group
      // Format: SQUAD_1 -> "Squad 1"
      const displayName = groupCode.startsWith('SQUAD_')
        ? `Squad ${groupCode.split('_')[1]}`
        : `Group ${groupCode}`;

      await Group.create({
        groupCode,
        groupName: displayName,
        createdBy: 'SYSTEM',
        description: 'Auto-generated squad'
      });
      console.log(`✅ Auto-created group: ${groupCode}`);
    }
  } catch (err) {
    console.error(`Failed to ensure group ${groupCode} exists:`, err);
  }
};

export class ParticipantService {
  static async register(data: {
    name: string;
    email: string;
    mobile: string;
    activityType: string;
    code?: string; // Manually provided code
    groupCode?: string;
  }) {
    const { name, email, mobile, activityType, code, groupCode } = data;

    // 1. Check if email already exists
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant) {
      throw new Error('This email is already registered. Use your unique code to log in.');
    }

    // 2. Determine Individual Code
    let individualCode = '';
    if (code) {
      // Manual Code Provided
      individualCode = code.toUpperCase();
      const existing = await Participant.findOne({ individualCode });
      if (existing) {
        throw new Error(`Code ${individualCode} is already in use.`);
      }
    } else {
      // Auto Generate
      let isUnique = false;
      while (!isUnique) {
        individualCode = generateCode(6);
        const existing = await Participant.findOne({ individualCode });
        if (!existing) isUnique = true;
      }
    }

    // 3. Determine Group Code (Auto-assign logic overrides manual unless null)
    const autoGroup = determineGroupCode(individualCode);
    if (autoGroup) {
      await ensureGroupExists(autoGroup);
    }
    const finalGroupCode = autoGroup || groupCode || null;

    // 4. Create Participant
    const participant = await Participant.create({
      name,
      email,
      mobile,
      activityType,
      individualCode,
      groupCode: finalGroupCode
    });

    // 5. Send welcome messages (Background - don't wait)
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
        // Expect CSV header "code" or "individualCode" as first column optionally
        const code = record.code || record.Code || record.individualCode || record['Participant Code'];
        const name = record.name || record.Name;
        const email = (record.email || record.Email)?.toLowerCase().trim();
        const mobile = record.mobile || record.Mobile || record.Phone || record.phone;
        const activityType = record.activityType || record.Activity || 'Walking';

        if (!name || !email || !mobile) {
          throw new Error(`Missing required fields for ${name || 'unknown'}`);
        }

        // Check duplicate email
        const existingEmail = await Participant.findOne({ email });
        if (existingEmail) {
          throw new Error(`Email ${email} already registered`);
        }

        // Determine Code
        let individualCode = '';
        if (code) {
          individualCode = code.toString().toUpperCase();
          const existingCode = await Participant.findOne({ individualCode });
          if (existingCode) {
            throw new Error(`Code ${individualCode} already exists`);
          }
        } else {
          let isUnique = false;
          while (!isUnique) {
            individualCode = generateCode(6);
            const exists = await Participant.findOne({ individualCode });
            if (!exists) isUnique = true;
          }
        }

        // Auto Assign Group
        const groupCode = determineGroupCode(individualCode);
        if (groupCode) {
          await ensureGroupExists(groupCode);
        }

        await Participant.create({
          name,
          email,
          mobile,
          activityType,
          individualCode,
          groupCode,
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

    // Enrich badges with definitions
    const enrichedBadges = BadgeService.getParticipantBadges(participant);

    return {
      ...participant.toObject(),
      badges: enrichedBadges
    };
  }

  static async getLeaderboard(limit = 50) {
    return Participant.find({ isActive: true })
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('name individualCode totalDistance totalDuration totalPoints streakDays');
  }

  static async getAll() {
    return Participant.find({ isActive: true }).sort({ totalPoints: -1 });
  }

  static async updateProfilePicture(code: string, profilePictureUrl: string) {
    const participant = await Participant.findOneAndUpdate(
      { individualCode: code.toUpperCase() },
      { profilePicture: profilePictureUrl },
      { new: true }
    );
    if (!participant) throw new Error('Participant not found');
    return participant;
  }
}