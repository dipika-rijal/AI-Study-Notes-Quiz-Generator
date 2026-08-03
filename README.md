# StudyGen AI

StudyGen AI is an application that generates AI-powered study notes, quizzes, and flashcards from your existing study material.

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Setup instructions](#setup-instructions)
- [Environment variables](#environment-variables)
- [Running tests](#running-tests)
- [Deployment](#deployment)

## Features

| Feature | Description |
|---|---|
| **Automated Study Notes** | Generate detailed, multi-level notes based on a topic or pasted text. |
| **AI-driven Quizzes** | Create focused practice sets on specific subjects with automated grading and explanations. |
| **Flashcards** | Turn notes into swipeable flashcards with mastery tracking. |
| **AI Tutor & Planner** | Conversational tutoring and AI-generated study plans. |
| **Document Summarization** | Upload and summarize PDFs. |
| **Streak & History** | Track your daily learning streaks and review past notes, quizzes, and conversations. |
| **Secure Authentication** | User accounts backed by Firebase. |

## Tech stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Zustand, React Query |
| **Backend** | Node.js, Express 5, MongoDB Atlas (Mongoose) |
| **Authentication** | Firebase Auth (client) + Firebase Admin SDK (server-side token verification) |
| **AI Engine** | Groq API (Llama 3) |
| **Testing** | Node Native Test Runner (backend), Vitest & Testing Library (frontend) |

## Requirements

- **Node.js** version 18 or higher
- **MongoDB Atlas** cluster
- **Firebase project** (with a generated Admin SDK service account key)
- **Groq API** key

## Quick start

```bash
git clone <repo-url>
cd StudyGenAI

cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# fill in backend/.env and frontend/.env — see Environment variables below

cd backend && npm run dev # terminal 1
cd frontend && npm run dev # terminal 2
```

The full walkthrough for each `.env` value is below.

## Setup instructions

### 1. Firebase
- Create a project at [console.firebase.google.com](https://console.firebase.google.com).
- Enable Authentication and turn on the sign-in methods you need (e.g. Email/Password).
- Go to Project Settings → General and copy your web app config into `frontend/.env`.
- Go to Project Settings → Service accounts and generate a new private key (downloads a JSON file). The backend's Firebase Admin SDK needs this to verify auth tokens — stringify the JSON and set it as `FIREBASE_SERVICE_ACCOUNT` in `backend/.env`.

### 2. Groq API key
- Go to [console.groq.com](https://console.groq.com).
- Generate an API key and add it to `backend/.env` as `GROQ_API_KEY`.

### 3. MongoDB Atlas
- Create a cluster on MongoDB Atlas.
- Under Network Access, whitelist your IP address or `0.0.0.0/0`.
- Copy the connection string into `backend/.env` as `MONGODB_URI`.

## Environment variables

### `backend/.env`

| Variable | Description |
|---|---|
| **PORT** | Port the backend listens on, e.g. 5000 |
| **CLIENT_URL** | Frontend origin, e.g. http://localhost:5173 |
| **MONGODB_URI** | MongoDB Atlas connection string |
| **GROQ_API_KEY** | Groq API key |
| **FIREBASE_PROJECT_ID** | Firebase project ID |
| **FIREBASE_SERVICE_ACCOUNT** | Stringified Firebase Admin service account JSON |

### `frontend/.env`

| Variable | Description |
|---|---|
| **VITE_API_BASE_URL** | Backend API base URL, e.g. http://localhost:5000/api |
| **VITE_FIREBASE_API_KEY** | Firebase web app config |
| **VITE_FIREBASE_AUTH_DOMAIN** | Firebase web app config |
| **VITE_FIREBASE_PROJECT_ID** | Firebase web app config |
| **VITE_FIREBASE_STORAGE_BUCKET** | Firebase web app config |
| **VITE_FIREBASE_MESSAGING_SENDER_ID**| Firebase web app config |
| **VITE_FIREBASE_APP_ID** | Firebase web app config |

Use `.env.example` in each directory as a starting template.

## Running tests

Both frontend and backend include lightweight, high-signal test suites.

### Backend (Native Node Test Runner)
```bash
cd backend
npm test
```
Covers core utilities like `streakUtils.js` and standard API response formats.

### Frontend (Vitest)
```bash
cd frontend
npm test
```
Covers `ErrorBoundary`, design-system components (`Badge`, `Button`), and utility functions like `flashcards.js` and `exportChatPdf.js`.

## Deployment

- Frontend deploys automatically to Vercel on push (see `frontend/vercel.json`).
- Backend deploys to Render, triggered by GitHub Actions.
- On Render, set every `backend/.env` variable above in the service dashboard — especially `FIREBASE_SERVICE_ACCOUNT`, since a missing or malformed value is a common cause of login failures in production.
- Set `CLIENT_URL` on Render to your deployed Vercel URL, and `VITE_API_BASE_URL` on Vercel to your deployed Render backend URL.
- For cross-domain auth cookies between Vercel and Render, the session cookie must use `sameSite: "none"` and `secure: true` in `backend/routes/authRoutes.js`.
