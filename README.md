# My Profile Link

Production-ready monorepo with:
- `frontend` (React + Vite + TypeScript)
- `backend` (Express + MongoDB + JWT + Stripe webhook)

## Prerequisites
- Node.js 20+
- npm 10+
- MongoDB database

## Environment Setup
1. Copy env template:
   - `backend/.env.example` -> `backend/.env`
2. Set required values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL` (required in production)
3. Optional feature flags:
   - `ENABLE_EMAIL=true` requires `SENDGRID_API_KEY` and `FROM_EMAIL`
   - `ENABLE_STRIPE=true` requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_BUSINESS_PRICE_ID`

## Run Locally
1. Backend:
   - `cd backend`
   - `npm install`
   - `npm run dev`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Frontend default: `http://localhost:5173`  
Backend default: `http://localhost:8080`

## Production Deployment (Docker)
1. Build image from repo root:
   - `docker build -t my-profile-link:latest .`
2. Run container:
   - `docker run --name my-profile-link -p 8080:8080 --env-file backend/.env my-profile-link:latest`
3. Health check:
   - `GET /health` should return `200` and `dbState: 1`

## Production Deployment (Without Docker)
1. Frontend build:
   - `cd frontend && npm ci && npm run build`
2. Backend install:
   - `cd backend && npm ci --omit=dev`
3. Copy frontend build output to backend public folder:
   - copy `frontend/dist/*` to `backend/public/`
4. Start backend:
   - `cd backend && NODE_ENV=production npm start`

## Production Readiness Checklist
- `NODE_ENV=production`
- `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` set
- If `ENABLE_EMAIL=true`: `SENDGRID_API_KEY`, `FROM_EMAIL` set
- If `ENABLE_STRIPE=true`: Stripe secret/webhook/price IDs set
- `CORS_ORIGINS` set if multiple frontend domains are used
- TLS termination configured at load balancer/reverse proxy
- `/health` monitored
- Logs aggregated and retained
- Secrets stored in deployment secret manager (not in git)
