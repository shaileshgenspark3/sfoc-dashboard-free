# Railway Deployment Guide for FIT-O-CHARITY Dashboard

This guide explains how to deploy the FIT-O-CHARITY Dashboard on Railway.

## Prerequisites

- A Railway account ([railway.app](https://railway.app))
- A MongoDB connection string (either MongoDB Atlas or Railway's MongoDB addon)
- Twilio credentials for WhatsApp notifications
- Gmail credentials for email notifications

## Deployment Steps

### 1. Fork or Clone the Repository

Make sure your code is in a GitHub repository that you can connect to Railway.

### 2. Create a New Project on Railway

1. Go to your Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 3. Deploy the Backend Service

1. When prompted to select a service, choose "Backend" or "Web Service"
2. Select the `/backend` directory
3. Railway will automatically detect it's a Node.js project

### 4. Configure Environment Variables

Go to the "Variables" tab in your Railway project and add these variables:

```
PORT=8080
MONGODB_URI=your_mongodb_connection_string
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1415523886
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=https://your-frontend-deployed-url
NODE_ENV=production
ENABLE_REMINDER_JOB=false
CRON_AUTH_TOKEN=your_secure_cron_token
```

**Important**: Set `ENABLE_REMINDER_JOB=false` to disable the internal cron job since we'll trigger reminders externally.

### 5. Add a MongoDB Database

1. Go to the "Database" tab
2. Click "New" and select "Database"
3. Choose "MongoDB" or connect to your MongoDB Atlas cluster

### 6. Configure the Frontend (Alternative Approach)

Since the backend serves the frontend, you don't need to deploy the frontend separately. The backend will serve the built frontend files.

However, if you prefer to deploy frontend and backend separately:

1. Create a new static site project on Railway
2. Point it to the `/frontend` directory
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`

### 7. Set Up External Cron Job for Reminders

Since Railway doesn't have built-in cron jobs like Vercel, you'll need to use an external service to trigger the reminder job daily:

1. Use a service like [cronhooks.io](https://cronhooks.io/) or [uptimerobot.com](https://uptimerobot.com/)
2. Create a periodic job that hits: `https://your-backend-app-domain/api/cron/reminders`
3. Set the Authorization header to: `Bearer your_secure_cron_token` (the same token you set as CRON_AUTH_TOKEN)

Example curl command for testing:
```bash
curl -H "Authorization: Bearer your_secure_cron_token" \
  https://your-backend-app-domain/api/cron/reminders
```

### 8. Deploy and Test

1. Push your changes to GitHub to trigger a new deployment
2. Monitor the deployment logs in Railway
3. Test all functionality including:
   - Activity submission
   - Real-time dashboard updates
   - Leaderboard
   - Group features
   - WebSocket connections

## Troubleshooting

### Common Issues

1. **Port Binding**: Make sure your app binds to the PORT environment variable (already configured in server.ts)

2. **Database Connection**: Verify your MongoDB connection string is correct and accessible

3. **CORS Issues**: The backend already includes CORS middleware, but check if you need to adjust settings

4. **Static Files**: The backend is configured to serve the frontend build files from `/dist`

### Environment Variables

Make sure all required environment variables are set in Railway:
- `MONGODB_URI` - Database connection string
- `TWILIO_*` - WhatsApp notification credentials
- `EMAIL_*` - Email notification credentials
- `CRON_AUTH_TOKEN` - Authentication token for cron endpoint
- `ENABLE_REMINDER_JOB=false` - Disable internal cron job

## Scaling

As your application grows, you can scale resources in the Railway dashboard under the "Settings" tab for each service.

## Support

If you encounter issues with the deployment, check the Railway logs in your dashboard. For issues with the application itself, refer to the main README.md file.