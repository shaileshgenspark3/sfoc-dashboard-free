import express from 'express';
import { 
  createGroup, 
  getGroupByCode, 
  joinGroup, 
  getGroupLeaderboard, 
  getAllGroups 
} from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroup);
router.get('/:code', getGroupByCode);
router.post('/:code/join', joinGroup);
router.get('/:code/leaderboard', getGroupLeaderboard);
router.get('/', getAllGroups);

export default router;
