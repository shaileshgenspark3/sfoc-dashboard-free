# FIT-O-CHARITY Dashboard Context

## 📋 Project Overview

**FIT-O-CHARITY** is a full-stack fitness tracking dashboard developed for the Sukrut Parivar Charitable Trust. It facilitates a 1-month fitness challenge where participants track activities (Walking, Running, Cycling, Yoga, Gym), join groups, and compete on leaderboards. The system features real-time updates via WebSockets and automated reminders.

## 🛠️ Tech Stack

### Backend (`/backend`)
- **Runtime:** Node.js (ES Modules), TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Real-time:** `ws` (WebSockets)
- **Jobs:** `node-cron` (Daily reminders)
- **Services:** Twilio (WhatsApp), Nodemailer (Email)
- **Validation:** Zod, Express Validator
- **Execution:** `tsx` for development

### Frontend (`/frontend`)
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion, Canvas Confetti
- **Charts:** Recharts
- **Icons:** Lucide React

## 📂 Project Structure

```
sfoc-dashboard/
├── backend/                  # API & Server Logic
│   ├── src/
│   │   ├── config/           # DB connection (database.ts)
│   │   ├── controllers/      # Route logic (activities, groups, participants)
│   │   ├── jobs/             # Cron jobs (reminderJob.ts)
│   │   ├── middleware/       # Error handling
│   │   ├── models/           # Mongoose schemas (Activity, Group, Participant)
│   │   ├── routes/           # Express routes
│   │   ├── services/         # External APIs (email, whatsapp)
│   │   └── websocket/        # Socket logic (socketHandler.ts)
│   ├── server.ts             # Entry point
│   └── package.json
├── frontend/                 # UI Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Main views (Dashboard, Leaderboard, etc.)
│   │   ├── services/         # API client (api.ts)
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── vite.config.ts
│   └── package.json
├── PLANS.md                  # Project plans & architecture
└── start.sh                  # Quick start script (backend dev mode)
```

## 🚀 Development Workflow

### Prerequisites
- Node.js v18+
- MongoDB instance (Local or Atlas)
- Twilio & Gmail credentials (optional for dev, required for full features)

### Setup & Installation

1.  **Backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env # Configure MONGODB_URI, PORT, etc.
    ```

2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    # Create .env with VITE_API_URL=http://localhost:5000/api
    ```

### Running the Project

*   **Backend Development:**
    ```bash
    cd backend
    npm run dev  # Runs with tsx watch
    ```

*   **Frontend Development:**
    ```bash
    cd frontend
    npm run dev  # Starts Vite server
    ```

*   **Production Build:**
    1.  Build Frontend: `cd frontend && npm run build`
    2.  Build Backend: `cd backend && npm run build`
    3.  Start: `node backend/dist/server.js` (Backend serves frontend static files)

## 🎨 Design Philosophy

The project follows an **"Industrial Cyberpunk"** or **"Glassmorphism"** aesthetic:
- **Visuals:** Frosted glass cards, animated gradients, high-contrast colors (Neon Orange, Protocol Green).
- **UX:** Dopamine-inducing interactions (confetti on submission), smooth transitions (Framer Motion).
- **Typography:** Space Grotesk (Headers), JetBrains Mono (Data).

## 🔑 Key Concepts

- **Participant ID:** Users identify via a unique 6-character code (no passwords).
- **WebSockets:** The dashboard updates in real-time when new activities are submitted.
- **Groups:** Participants can join groups/squads for collective tracking.
- **Reminders:** Automated jobs run daily at 6 PM IST to notify inactive participants.
