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

## Notes for DBMS Viva

- Input validation and structured error responses are implemented in backend routes.
