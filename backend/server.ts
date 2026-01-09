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

// Routes
import activityRoutes from './src/routes/activities.js';
import participantRoutes from './src/routes/participants.js';
import groupRoutes from './src/routes/groups.js';
import settingsRoutes from './src/routes/settings.js';
import vercelCronRoutes from './src/routes/cron.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to Database (with automatic fallback to in-memory)
connectDB().then(() => {
  // Start Cron Jobs only if enabled
  if (process.env.ENABLE_REMINDER_JOB !== 'false') {
    ReminderJob.start();
  } else {
    console.log('⚠️ Reminder job disabled via environment variable');
  }
});

const app = express();
const httpServer = createServer(app);

// WebSocket
initWebSocket(httpServer);

// Global Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for dev simplicity with external assets
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/activities', activityRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cron', vercelCronRoutes);

// Static Files - Serve Frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log('📂 Frontend Path resolved to:', frontendPath);
app.use(express.static(frontendPath));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`
    🌟 FIT-O-CHARITY BACKEND V2 🌟
    ---------------------------------------
    🚀 Server:  http://localhost:${PORT}
    📡 Status:  Active
    🛠️  Mode:    ${process.env.NODE_ENV || 'development'}
    ---------------------------------------
    `);
  });
}

export { app, httpServer };
