import express from 'express';
import { 
  createGroup, 
  getGroupByCode, 
  joinGroup, 
  getGroupLeaderboard, 
  getGroupActivities,
  getAllGroups 
} from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroup);
router.get('/:code', getGroupByCode);
router.post('/:code/join', joinGroup);
router.get('/:code/leaderboard', getGroupLeaderboard);
router.get('/:code/activities', getGroupActivities); // New Route
router.get('/', getAllGroups);

export default router;