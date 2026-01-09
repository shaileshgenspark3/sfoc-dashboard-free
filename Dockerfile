# Stage 1: Build Frontend
FROM node:24-alpine as frontend-builder
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:24-alpine as backend-builder
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Production
FROM node:24-alpine
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Copy built backend
COPY --from=backend-builder /build/backend/dist ./dist
COPY backend/package*.json ./
RUN npm install --omit=dev

# Railway provides PORT environment variable automatically
EXPOSE 8080
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server.js"]
