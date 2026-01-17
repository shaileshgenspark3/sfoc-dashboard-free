import express from 'express';
import { exportAllData, getAllActivities, updateActivity, deleteActivity } from '../controllers/activityController.js';

import { StravaService } from '../services/stravaService.js';

const router = express.Router();

router.get('/export', exportAllData);
router.get('/activities', getAllActivities);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

router.post('/sync-strava', async (req, res) => {
    try {
        const count = await StravaService.syncAllAthletes();
        res.json({ success: true, count });
    } catch (error) {
        console.error('Manual sync failed:', error);
        res.status(500).json({ error: 'Manual sync failed' });
    }
});

export default router;