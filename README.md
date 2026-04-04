# Noobies Typing Practice

A full-stack typing practice web app built with:
- React + Vite + Tailwind CSS + Framer Motion (frontend)
- Node.js + Express + JWT (backend)
- MongoDB (database)

## Project Structure

```text
typing website/
+-- client/      # React frontend
+-- server/      # Express API + MongoDB integration
+-- database/    # SQL schema, sample data, ER explanation
```

## Features

- Time-based typing tests: 30s, 60s, 120s
- Word-based typing tests: 25, 50, 100 words
- Real-time correct/incorrect highlighting
- Live WPM and accuracy calculation
- Restart test support
- Login/Signup with JWT authentication
- Save scores to MongoDB
- Global leaderboard (top 10)
- User dashboard with history, best score, and averages
- Admin login and score dashboard (`/admin`)
- Responsive UI with dark/light mode and smooth animations

## Database Design

- Database name: `typing_app` (MongoDB)
- Collections:
  - `users`
  - `results`

## Local Setup

### 1) Database

1. Start MongoDB locally.
2. Ensure `server/.env` has valid `MONGO_URI`.

### 2) Backend (server)

```bash
cd server
npm install
cp .env.example .env
# update DB credentials + JWT secret
node server.js
```

API runs at `http://localhost:5000`.

### 3) Frontend (client)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## REST API Endpoints

- `POST /api/signup`
- `POST /api/login`
- `POST /api/save-score` (JWT required)
- `GET /api/leaderboard`
- `GET /api/user-history` (JWT required)
- `POST /api/admin/login`
- `GET /api/admin/scores` (JWT required + admin only)

## Admin Seed Account

- Email and password are controlled from `server/.env`:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

## Deploy On Google

### Backend on Google Cloud Run

1. Install and login:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```
2. From `server/` deploy:
```bash
gcloud run deploy noobies-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```
3. Set Cloud Run environment variables in Google Cloud Console:
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- (optional) `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

### Frontend on Firebase Hosting (Google)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```
2. In `client/`:
```bash
cp .firebaserc.example .firebaserc
cp .env.production.example .env.production
```
3. Edit:
- `.firebaserc` -> set your Google project id
- `.env.production` -> set `VITE_API_URL` to your Cloud Run backend URL
4. Build and deploy:
```bash
npm install
npm run build
firebase deploy --only hosting
```

## Backend Deploy (Render - easiest)

This repo now includes `render.yaml` for one-click backend deployment.

1. Go to Render and create a new `Blueprint` service from this GitHub repo.
2. Render will detect `render.yaml` and create service `noobies-api`.
3. In Render, set environment values:
   - `MONGO_URI` (MongoDB Atlas URI)
   - `JWT_SECRET` (strong random secret)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - Optional: `ADMIN_USERNAME`
4. Deploy and copy your backend URL:
   - Example: `https://noobies-api.onrender.com`
   - API base becomes: `https://noobies-api.onrender.com/api`
5. In your frontend on GitHub Pages:
   - Open Login page
   - If needed, set Backend API URL to your Render URL with `/api`
   - Example: `https://noobies-api.onrender.com/api`

## Notes for DBMS Viva

- Input validation and structured error responses are implemented in backend routes.

## GitHub Pages (Frontend Link)

If your GitHub website link is not opening, use this setup:

1. Push this repo to GitHub on `main`.
2. In GitHub repo settings:
   - Go to `Settings -> Pages`
   - Set `Source` to `GitHub Actions`
3. Add repository secret:
   - `Settings -> Secrets and variables -> Actions -> New repository secret`
   - Name: `VITE_API_URL`
   - Value: your deployed backend API URL (example: `https://your-api.run.app/api`)
4. Wait for workflow `Deploy Client to GitHub Pages` to complete.

Then open:
- `https://<your-username>.github.io/<your-repo>/`

### Owner-only Backend URL Panel

By default, backend URL settings are hidden on auth page.
Only owner mode can see it:

- Open: `https://<your-username>.github.io/<your-repo>/?owner=1#/auth`
- Then set API URL (for local PC backend use `http://localhost:5000/api`)
