# StudyGen AI

StudyGen AI is an application that generates AI-powered study notes and quizzes from your existing study material.

## Features
- **Automated Study Notes**: Generate detailed, multi-level notes based on a topic or pasted text.
- **AI-driven Quizzes**: Create focused practice sets on specific subjects with automated grading and explanations.
- **Document Summarization**: Upload and summarize PDFs.
- **Streak & History**: Track your daily learning streaks and review past notes and quizzes.
- **Secure Authentication**: User accounts backed by Firebase.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB Atlas
- **Authentication**: Firebase Auth
- **AI Engine**: Groq API (Llama 3)
- **Testing**: Node Native Test Runner (Backend), Vitest & Testing Library (Frontend)

## Requirements
- Node.js version 18 or higher

## Setup Instructions

### Firebase Setup
1. Create a Firebase project at console.firebase.google.com.
2. Enable Authentication.
3. Get the config values to place into `frontend/.env`.

### Groq API Key Setup
1. Go to console.groq.com.
2. Generate an API key and add to `backend/.env`.

### MongoDB Atlas Setup
1. Create a cluster on MongoDB Atlas.
2. Under Network Access, whitelist your IP address or `0.0.0.0/0`.
3. Get the connection string and place into `backend/.env`.

## Installation Guide
1. Clone the repository.
2. `cd backend && npm install`
3. `cd frontend && npm install`
4. Setup `.env` files using `.env.example` as a template in both `frontend` and `backend` directories.
5. Run backend: `cd backend && npm run dev`
6. Run frontend: `cd frontend && npm run dev`

## Running Tests
Both frontend and backend include lightweight, high-signal test suites.

**Backend Tests** (Native Node Test Runner)
```bash
cd backend
npm test
```
Tests core utilities like `streakUtils.js` and standard API response formats.

**Frontend Tests** (Vitest)
```bash
cd frontend
npm test
```
Tests critical React components like the application `ErrorBoundary`.

## Deployment
- **Frontend** deploys automatically via Netlify.
- **Backend** deploys via Render, triggered by GitHub actions.

*(If you are deploying live, remember to set your environment variables on Render and Netlify dashboards, and add your live URLs here!)*
