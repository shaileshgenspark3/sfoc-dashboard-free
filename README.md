# 🏆 FIT-O-CHARITY Dashboard - Sukrut Parivar Charitable Trust

A stunning, dopamine-inducing fitness tracking dashboard for a 1-month fitness challenge event!

## ✨ Features

- **📊 Real-time Dashboard** - Live activity feed with WebSocket updates
- **📝 Activity Submission** - Beautiful form with activity types (Walking, Running, Cycling, Yoga, Gym)
- **🏆 Leaderboard** - Live rankings with animated podium
- **👥 Group Dashboards** - Separate views for communities, schools, and gyms
- **⏰ Automated Reminders** - WhatsApp + Email reminders at 6 PM daily
- **🎉 Dopamine-Inducing UI** - Glassmorphism design, confetti celebrations, smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Twilio account (for WhatsApp)
- Gmail account (for email)

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

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Environment Variables

### Backend (.env)

```env
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

### Frontend

Create `.env` in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
sfoc-dashboard/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # WhatsApp & Email
│   │   ├── websocket/      # Real-time updates
│   │   └── jobs/           # Reminder cron job
│   └── server.js
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── styles/         # CSS styles
│   └── index.html
└── README.md
```

## 📱 Features Breakdown

### Activity Submission
- Enter your unique 6-character code
- Select activity type (Walking, Running, Cycling, Yoga, Gym)
- Optional: Distance (km) and Duration (minutes)
- Optional: Group code for team activities
- Confetti celebration on submission!

### Real-time Dashboard
- Live activity feed with animations
- Total statistics (participants, distance, duration)
- Today's activity count
- How-it-works section

### Leaderboard
- Animated podium for top 3
- Full rankings with streak badges
- Click crown to celebrate!

### Group Feature
- Create new group with unique code
- Search existing groups
- Add members to groups
- Group-specific leaderboard

### Automated Reminders
- Runs daily at 6 PM IST
- Finds participants who haven't submitted
- Sends WhatsApp via Twilio
- Sends Email via Gmail SMTP

## 🎨 Design Highlights

- **Glassmorphism UI** - Frosted glass effect cards
- **Animated Gradients** - Moving background colors
- **Confetti Celebrations** - Canvas confetti on achievements
- **Smooth Transitions** - Framer Motion animations
- **Micro-interactions** - Hover and click effects

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite (TypeScript)
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Canvas Confetti
- React Hot Toast

**Backend:**
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- WebSocket (ws)
- Zod (Validation)
- Node-Cron
- Twilio SDK
- Nodemailer

## 🎨 Design Philosophy: Industrial Utilitarian
The application has been refactored to follow a high-performance industrial aesthetic, focusing on grit, precision, and performance metrics.
- **Typography:** Space Grotesk (Headers), JetBrains Mono (Technical Data)
- **Colors:** Deep Charcoal, Safety Orange, Signal Green
- **Tactile UI:** Asymmetric layouts, diagonal textures, and technical specification panels.

## 📦 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy dist folder to Vercel
```

### Backend (Render/Railway)

```bash
cd backend
# Deploy to Render/Railway with your .env variables
```

### Railway-Specific Instructions

For detailed Railway deployment instructions, see [README.railway.md](README.railway.md).

Railway is recommended as an alternative to Vercel due to the application's backend complexity with WebSocket functionality, cron jobs, and database connections. The project has been configured with:

- Dockerfiles for both frontend and backend
- Railway configuration files
- Modified cron job functionality for external triggering
- Proper environment variable handling

## 🎯 Event Details

- **Event:** SFOC Shape Fit Open Challenge
- **Duration:** January 8 - February 8, 2025 (1 Month)
- **Goal:** Transform lives through daily physical activity

---

Built with ❤️ for fitness enthusiasts!
<!-- Trigger build -->
