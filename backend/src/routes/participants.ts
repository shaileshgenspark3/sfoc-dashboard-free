import express from 'express';
import multer from 'multer';
import { 
  registerParticipant, 
  getParticipantByCode, 
  getAllParticipants, 
  getParticipantsByGroup, 
  updateParticipantGroup, 
  getLeaderboard,
  bulkImportParticipants
} from '../controllers/participantController.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/register', registerParticipant);
router.post('/bulk-import', upload.single('file'), bulkImportParticipants);
router.get('/code/:code', getParticipantByCode);
router.get('/', getAllParticipants);
router.get('/group/:groupCode', getParticipantsByGroup);
router.put('/:code/join-group', updateParticipantGroup);
router.get('/leaderboard', getLeaderboard);

export default router;
