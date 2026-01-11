import express from 'express';
import { StravaService } from '../services/stravaService.js';

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
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }
    res.redirect(`${frontendUrl}/my-performance?strava=success`);
  } catch (error) {
    console.error('Strava callback error:', error);
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }
    res.redirect(`${frontendUrl}/my-performance?strava=error`);
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
