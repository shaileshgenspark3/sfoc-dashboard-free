import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activityService.js';
import { validateActivity } from '../utils/validation.js';

export const submitActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = validateActivity(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: (result.error as any).errors[0].message });
    }

    const submissionData = {
      ...result.data,
      groupCode: result.data.groupCode || undefined
    };

    const submissionResult = await ActivityService.submit(submissionData);
    
    res.status(201).json({
      success: true,
      message: 'Activity Logged! 🔥',
      data: submissionResult
    });
  } catch (err: any) {
    res.status(err.message.includes('Invalid') ? 404 : 500).json({ 
      error: err.message 
    });
  }
};

export const getTodayActivities = async (req: Request, res: Response) => {
  try {
    const activities = await ActivityService.getToday();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await ActivityService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getParticipantActivities = async (req: Request, res: Response) => {
  try {
    const activities = await ActivityService.getByParticipant(req.params.code);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};