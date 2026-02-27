# -----------------------------
# Stage 1: Build Frontend
# -----------------------------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Install dependencies first (better layer caching)
COPY frontend/package*.json ./
RUN npm ci

# Copy source
COPY frontend .

# Build production frontend
RUN npm run build


# -----------------------------
# Stage 2: Backend Runtime
# -----------------------------
FROM node:22-alpine

WORKDIR /app/backend

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend .

# Copy frontend build into backend public folder
COPY --from=frontend-build /app/frontend/dist ./public

# Set production environment
ENV NODE_ENV=production


# Use non-root user (Node image already provides one)
USER node

EXPOSE 8080

HEALTHCHECK CMD node -e "require('http').get('http://127.0.0.1:8080/health',res=>{process.exit(res.statusCode===200?0:1)})"

CMD ["node", "server.js"]
