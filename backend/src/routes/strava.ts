import express from 'express';
import { StravaService } from '../services/stravaService.js';
import toast from 'react-hot-toast';

const router = express.Router();

router.get('/auth/:participantCode', (req, res) => {
  const url = StravaService.getAuthUrl(req.params.participantCode);
  res.json({ url });
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    await StravaService.handleCallback(code as string, state as string);
    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/my-performance?strava=success`);
  } catch (error) {
    console.error('Strava callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-performance?strava=error`);
  }
});

router.post('/sync/:participantCode', async (req, res) => {
  try {
    const synced = await StravaService.syncActivities(req.params.participantCode);
    res.json({ success: true, syncedCount: synced?.length || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
