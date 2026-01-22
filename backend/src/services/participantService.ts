import Participant, { IParticipant } from '../models/Participant.js';
import { generateCode } from '../utils/codeGenerator.js';
import EmailService from './emailService.js';
import WhatsAppService from './whatsappService.js';
import { BadgeService } from './badgeService.js';
import { determineGroupCode } from '../utils/validation.js';

import Group from '../models/Group.js';
import Activity from '../models/Activity.js';
import Message from '../models/Message.js';

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

  static async update(id: string, data: Partial<IParticipant>) {
    const participant = await Participant.findByIdAndUpdate(id, data, { new: true });
    if (!participant) throw new Error('Participant not found');
    return participant;
  }

  static async delete(id: string) {
    const participant = await Participant.findById(id);
    if (!participant) throw new Error('Participant not found');

    const { individualCode, groupCode } = participant;

    // 1. Delete Activities
    await Activity.deleteMany({ participantCode: individualCode });

    // 2. Remove from Group
    if (groupCode) {
      await Group.updateOne(
        { groupCode },
        { $pull: { members: { individualCode } } }
      );
    }

    // 3. Delete Messages (sender)
    await Message.deleteMany({ senderCode: individualCode });

    // 4. Delete Participant
    await Participant.findByIdAndDelete(id);

    return { message: `Successfully deleted participant ${individualCode} and all related data.` };
  }
}