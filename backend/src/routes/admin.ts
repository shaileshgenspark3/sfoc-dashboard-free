import express from 'express';
import { exportAllData, getAllActivities, updateActivity, deleteActivity } from '../controllers/activityController.js';

const router = express.Router();

router.get('/export', exportAllData);
router.get('/activities', getAllActivities);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

export default router;