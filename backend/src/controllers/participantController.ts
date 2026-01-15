import { Request, Response } from 'express';
import { ParticipantService } from '../services/participantService.js';
import csv from 'csv-parser';
import fs from 'fs';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const registerParticipant = async (req: Request, res: Response) => {
  try {
    const participant = await ParticipantService.register(req.body);
    res.status(201).json({
      message: 'Registration successful!',
      participant: {
        name: participant.name,
        individualCode: participant.individualCode,
        groupCode: participant.groupCode
      }
    });
  } catch (error: any) {
    res.status(error.message.includes('registered') ? 400 : 500).json({ 
      error: error.message 
    });
  }
};

export const bulkImportParticipants = async (req: Request, res: Response) => {
  const multerReq = req as MulterRequest;
  if (!multerReq.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results: any[] = [];
  fs.createReadStream(multerReq.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const importResults = await ParticipantService.bulkImport(results);
        fs.unlinkSync(multerReq.file!.path); // Clean up temp file
        res.json({
          message: 'Bulk import completed',
          ...importResults
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });
};

export const getParticipantByCode = async (req: Request, res: Response) => {
  try {
    const participant = await ParticipantService.getByCode(req.params.code);
    res.json(participant);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getAllParticipants = async (req: Request, res: Response) => {
  try {
    const participants = await ParticipantService.getAll();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await ParticipantService.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  const multerReq = req as MulterRequest;
  if (!multerReq.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  try {
    const profilePictureUrl = `/uploads/profiles/${multerReq.file.filename}`;
    const participant = await ParticipantService.updateProfilePicture(req.params.code, profilePictureUrl);
    res.json({ success: true, profilePicture: participant.profilePicture });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ... other controller methods
export const getParticipantsByGroup = async (req: Request, res: Response) => {};
export const updateParticipantGroup = async (req: Request, res: Response) => {};