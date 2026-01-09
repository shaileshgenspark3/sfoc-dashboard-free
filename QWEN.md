# FIT-O-CHARITY Dashboard - Project Context

## Project Overview

The FIT-O-CHARITY Dashboard is a full-stack fitness tracking application built for the Sukrut Parivar Charitable Trust's fitness challenge event. It features real-time dashboards, activity submission, leaderboards, and automated reminder systems with a focus on industrial utilitarian design aesthetics.

### Key Features
- **Real-time Dashboard**: Live activity feed with WebSocket updates
- **Activity Submission**: Form for submitting various activity types (Walking, Running, Cycling, Yoga, Gym)
- **Leaderboard**: Live rankings with animated podium
- **Group Dashboards**: Separate views for communities, schools, and gyms
- **Automated Reminders**: WhatsApp and email reminders sent daily at 6 PM
- **Dopamine-Inducing UI**: Glassmorphism design, confetti celebrations, smooth animations

### Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: WebSocket connections for live updates
- **Design Philosophy**: Industrial Utilitarian aesthetic with Space Grotesk and JetBrains Mono typography

## Building and Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Twilio account (for WhatsApp notifications)
- Gmail account (for email notifications)

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# - MongoDB URI
# - Twilio credentials
# - Email credentials

# Start server in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Quick Start Script
The project includes a start script:
```bash
./start.sh
```

## Development Conventions

### Backend Structure
```
backend/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Request handlers
│   ├── jobs/           # Cron jobs (reminders)
│   ├── middleware/     # Error handling, validation
│   ├── models/         # MongoDB schemas (Participant, Activity, Group)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic (WhatsApp, Email)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   └── websocket/      # Real-time socket handling
└── server.ts           # Main server entry point
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (Dashboard, SubmitActivity, etc.)
│   ├── services/       # API clients and WebSocket connections
│   ├── styles/         # CSS styles
│   └── App.tsx         # Main application router
├── public/             # Static assets
└── index.html          # HTML template
```

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Tech Stack

**Frontend:**
- React 18 + Vite (TypeScript)
- Tailwind CSS
- Framer Motion (animations)
- Lucide Icons
- Canvas Confetti (celebrations)
- React Hot Toast (notifications)

**Backend:**
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- WebSocket (ws)
- Zod (validation)
- Node-Cron (scheduled tasks)
- Twilio SDK (WhatsApp notifications)
- Nodemailer (email notifications)

### Key Data Models

**Participant Model:**
- name, email, mobile
- activityType (Walking, Running, Cycling, Yoga, Gym, Other)
- individualCode (unique 6-character identifier)
- groupCode (optional group association)
- totalDistance, totalDuration, streakDays
- lastActivityDate, createdAt

**Activity Model:**
- participantCode, participantName
- activityType, distance, duration
- groupCode (optional)
- date, createdAt

## Testing and Deployment

### Frontend Deployment (Vercel)
```bash
cd frontend
npm run build
# Deploy dist folder to Vercel
```

### Backend Deployment (Render/Railway)
```bash
cd backend
# Deploy to Render/Railway with your .env variables
```

## Special Notes

1. **Authentication**: Uses unique 6-character codes instead of traditional username/password
2. **Real-time Updates**: Implemented with WebSocket connections for live dashboard updates
3. **Automated Reminders**: Cron job runs daily at 6 PM to send reminders to participants who haven't submitted activities
4. **Group Functionality**: Allows creation of groups with unique codes for team-based challenges
5. **Industrial Design**: Features glassmorphism UI, animated gradients, and tactile micro-interactions