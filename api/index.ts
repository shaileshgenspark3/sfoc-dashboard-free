// Point to the COMPILED backend file
import { app } from '../backend/dist/server.js';
import { connectDB } from '../backend/dist/src/config/database.js';

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // Ensure DB connection is alive on every cold start
  await connectDB();
  
  // Forward request to Express app
  return app(req, res);
}
