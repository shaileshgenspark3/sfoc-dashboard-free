import { app } from '../backend/server.js';
import { connectDB } from '../backend/src/config/database.js';

let isConnected = false;

export default async function handler(req: any, res: any) {
  try {
    if (!isConnected) {
      console.log('🔄 Initializing Database Connection...');
      await connectDB();
      isConnected = true;
      console.log('✅ Database Connected');
    }
    
    // Express app handles the rest
    return app(req, res);
  } catch (error) {
    console.error('🔥 Serverless Function Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
