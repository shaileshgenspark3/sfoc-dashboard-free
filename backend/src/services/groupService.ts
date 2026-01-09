import Group, { IGroup } from '../models/Group.js';
import Participant from '../models/Participant.js';
import { generateCode } from '../utils/codeGenerator.js';

export class GroupService {
  static async create(data: {
    groupName: string;
    description: string;
    createdBy: string;
  }) {
    const { groupName, description, createdBy } = data;

    // 1. Generate unique group code
    let groupCode = '';
    let isUnique = false;
    while (!isUnique) {
      groupCode = generateCode(6);
      const existing = await Group.findOne({ groupCode });
      if (!existing) isUnique = true;
    }

    // 2. Create Group
    const group = await Group.create({
      groupName,
      groupCode,
      description,
      createdBy: createdBy.toUpperCase(),
      members: [{
        individualCode: createdBy.toUpperCase(),
        joinedAt: new Date()
      }]
    });

    // 3. Add creator to the group
    await Participant.findOneAndUpdate(
      { individualCode: createdBy.toUpperCase() },
      { groupCode: groupCode }
    );

    return group;
  }

  static async join(groupCode: string, individualCode: string) {
    const gCode = groupCode.toUpperCase();
    const pCode = individualCode.toUpperCase();

    const group = await Group.findOne({ groupCode: gCode });
    if (!group) throw new Error('Group not found.');

    const participant = await Participant.findOne({ individualCode: pCode });
    if (!participant) throw new Error('Participant not found.');

    const alreadyMember = group.members.some(m => m.individualCode === pCode);
    if (alreadyMember) throw new Error('You are already a member of this group.');

    // Add to group
    group.members.push({ individualCode: pCode, joinedAt: new Date() });
    await group.save();

    // Update participant
    participant.groupCode = gCode;
    await participant.save();

    return group;
  }

  static async getLeaderboard(groupCode: string) {
    const group = await Group.findOne({ groupCode: groupCode.toUpperCase() });
    if (!group) throw new Error('Group not found.');

    const memberCodes = group.members.map(m => m.individualCode);

    const leaderboard = await Participant.find({
      individualCode: { $in: memberCodes }
    })
      .sort({ totalPoints: -1 })
      .select('name individualCode totalDistance totalDuration totalPoints streakDays');

    return {
      groupName: group.groupName,
      totalMembers: group.members.length,
      totalDistance: group.totalDistance,
      totalDuration: group.totalDuration,
      leaderboard
    };
  }
}
