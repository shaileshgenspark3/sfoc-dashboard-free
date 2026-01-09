import express from 'express';
import { submitActivity, getTodayActivities, getStats, getParticipantActivities } from '../controllers/activityController.js';

const router = express.Router();

router.post('/submit', submitActivity);
router.get('/today', getTodayActivities);
router.get('/stats', getStats);
router.get('/participant/:code', getParticipantActivities);

export default router;
