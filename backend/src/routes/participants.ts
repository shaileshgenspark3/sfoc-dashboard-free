import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  registerParticipant, 
  getParticipantByCode, 
  getAllParticipants, 
  getParticipantsByGroup, 
  updateParticipantGroup, 
  getLeaderboard,
  bulkImportParticipants,
  uploadProfilePicture
} from '../controllers/participantController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProfile = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const upload = multer({ dest: 'uploads/' }); // For bulk import (temp)
const router = express.Router();

router.post('/register', registerParticipant);
router.post('/bulk-import', upload.single('file'), bulkImportParticipants);
router.get('/code/:code', getParticipantByCode);
router.get('/', getAllParticipants);
router.get('/group/:groupCode', getParticipantsByGroup);
router.put('/:code/join-group', updateParticipantGroup);
router.get('/leaderboard', getLeaderboard);
router.post('/:code/upload-profile', uploadProfile.single('image'), uploadProfilePicture);

export default router;
