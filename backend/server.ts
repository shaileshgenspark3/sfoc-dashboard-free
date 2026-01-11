import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { connectDB } from './src/config/database.js';
import { initWebSocket } from './src/websocket/socketHandler.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import ReminderJob from './src/jobs/reminderJob.js';
import StravaSyncJob from './src/jobs/stravaSyncJob.js';

// Routes
import activityRoutes from './src/routes/activities.js';
import participantRoutes from './src/routes/participants.js';
import groupRoutes from './src/routes/groups.js';
import settingsRoutes from './src/routes/settings.js';
import vercelCronRoutes from './src/routes/cron.js';
import adminRoutes from './src/routes/admin.js';
import stravaRoutes from './src/routes/strava.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// WebSocket
initWebSocket(httpServer);

// Global Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*', // Allow Cloudflare Pages
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/activities', activityRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cron', vercelCronRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/strava', stravaRoutes);

// Static Files - Serve Frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log('📂 Frontend Path resolved to:', frontendPath);
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built');
  }
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Unified Start Function
const startServer = async () => {
  try {
    console.log('🔗 Connecting to Database...');
    await connectDB();
    
    // Start Cron Jobs only if enabled
    if (process.env.ENABLE_REMINDER_JOB !== 'false') {
      ReminderJob.start();
      StravaSyncJob.start();
    }

    console.log('🏁 Starting HTTP server...');
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`
      🌟 FIT-O-CHARITY BACKEND V2 🌟
      ---------------------------------------
      🚀 Server:  http://localhost:${PORT}
      📡 Status:  Active
      🛠️  Mode:    ${process.env.NODE_ENV || 'production'}
      ---------------------------------------
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

export { app, httpServer };