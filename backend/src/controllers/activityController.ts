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

export const exportAllData = async (req: Request, res: Response) => {
  try {
    const csvData = await ActivityService.getAllDataForExport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sfoc_data_export.csv');
    res.status(200).send(csvData);
  } catch (err) {
    console.error('Export Error:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
};

export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const activities = await ActivityService.getAllActivities();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all activities' });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    await ActivityService.deleteActivity(req.params.id);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete activity' });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const updated = await ActivityService.updateActivity(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update activity' });
  }
};