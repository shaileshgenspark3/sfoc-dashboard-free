# Stage 1: Build Frontend
FROM node:24-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:24-alpine as backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Production
FROM node:24-alpine
WORKDIR /app

# Copy built frontend to /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy built backend dist to /app/backend/dist
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY backend/package*.json ./backend/

# Install production dependencies for backend
WORKDIR /app/backend
RUN npm install --omit=dev

# Expose port
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Start from /app/backend/dist
# server.ts uses path.join(__dirname, '../frontend/dist')
# __dirname will be /app/backend/dist
# So it will look for /app/backend/frontend/dist which is wrong.
# Let's fix the server.ts to be more robust or move the frontend.

# Fix: Move frontend/dist to /app/backend/frontend/dist
RUN mkdir -p /app/backend/frontend && mv /app/frontend/dist /app/backend/frontend/dist

CMD ["node", "dist/server.js"]