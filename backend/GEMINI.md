# SFOC Dashboard Backend

This is the backend service for the SFOC (Shape Fit Open Challenge) Dashboard. It is a Node.js application built with Express and MongoDB, providing APIs for participants, activities, and groups, along with real-time updates via WebSockets and automated jobs.

## Project Overview

*   **Type:** Node.js Backend Application (ES Modules)
*   **Framework:** Express.js
*   **Database:** MongoDB (using Mongoose)
*   **Key Features:**
    *   RESTful API for managing Participants, Groups, and Activities.
    *   Real-time updates using WebSockets (`ws`).
    *   Scheduled tasks (Reminders) using `node-cron`.
    *   External integrations: Twilio (WhatsApp/SMS), Nodemailer (Email).

## Architecture

The project follows a standard MVC-like structure (without strict controllers, logic is currently in routes):

*   `server.js`: Application entry point, server setup, middleware, and database connection.
*   `src/models/`: Mongoose schema definitions (`Activity`, `Group`, `Participant`).
*   `src/routes/`: Express route definitions and business logic.
*   `src/websocket/`: WebSocket handler for real-time communication.
*   `src/jobs/`: Scheduled background jobs (e.g., reminders).
*   `src/services/`: External services integration (Email, WhatsApp).
*   `src/utils/`: Helper functions.

## Building and Running

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB Instance (Local or Atlas)

### Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Environment:**
    Copy `.env.example` to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```
    *   `PORT`: Server port (default 5000).
    *   `MONGODB_URI`: Connection string for MongoDB.
    *   `TWILIO_*` / `WHATSAPP_*`: Twilio configuration for messaging.
    *   `EMAIL_*`: SMTP configuration for emails.

### Running the Server
*   **Development Mode (with Nodemon):**
    ```bash
    npm run dev
    ```
*   **Production Mode:**
    ```bash
    npm start
    ```

## API Endpoints

*   `/api/participants`: Manage participant data (profile, stats).
*   `/api/groups`: Manage groups (creation, joining, leaderboards).
*   `/api/activities`: Log and retrieve physical activities.
*   `/api/reminders/send`: Manual trigger for reminder jobs.
*   `/api/health`: Health check endpoint.

## Development Conventions

*   **Module System:** The project uses **ES Modules** (`import`/`export`) as defined in `package.json` (`"type": "module"`).
*   **Database Interaction:** All database operations are performed via **Mongoose** models.
*   **Asynchronous Code:** usage of `async/await` with `try/catch` blocks for error handling in routes.
*   **Validation:** Input validation should be handled (currently partial implementation, `express-validator` is listed in dependencies).
*   **Security:** `helmet` is used for setting HTTP headers, and `cors` for Cross-Origin Resource Sharing.
