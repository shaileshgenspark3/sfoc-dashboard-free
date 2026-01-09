import { Request, Response } from 'express';
import Settings from '../models/Settings.js';

export const getSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    let setting = await Settings.findOne({ key });
    
    // Default values if not found
    if (!setting && key === 'show_leaderboard') {
      setting = await Settings.create({ key, value: false });
    }

    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
