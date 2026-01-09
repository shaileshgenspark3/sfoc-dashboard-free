import { Request, Response } from 'express';
import { GroupService } from '../services/groupService.js';

export const createGroup = async (req: Request, res: Response) => {
  try {
    const group = await GroupService.create(req.body);
    res.status(201).json({
      message: 'Group created successfully!',
      group: {
        groupName: group.groupName,
        groupCode: group.groupCode
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const group = await GroupService.join(req.params.code, req.body.individualCode);
    res.json({
      message: `Successfully joined ${group.groupName}!`,
      group: {
        groupName: group.groupName,
        groupCode: group.groupCode
      }
    });
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ 
      error: error.message 
    });
  }
};

export const getGroupLeaderboard = async (req: Request, res: Response) => {
  try {
    const data = await GroupService.getLeaderboard(req.params.code);
    res.json(data);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getGroupByCode = async (req: Request, res: Response) => {};
export const getAllGroups = async (req: Request, res: Response) => {};