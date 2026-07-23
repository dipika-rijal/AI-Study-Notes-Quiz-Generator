# StudyGen AI

StudyGen AI is an application that generates AI-powered study notes and quizzes.

## Features
- Automated study notes generation
- AI-driven quizzes based on specific topics
- Streak tracking and activity history
- Secure authentication

## Tech Stack
- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth
- **AI**: Groq API

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

## Folder Architecture
- `/backend`: Express server and API routes
- `/frontend`: React client code
- `/docs`: Documentation and Postman collection
- `/scripts`: Automation and deployment scripts
- `/.github`: CI/CD workflows

## Installation Guide
1. Clone the repository.
2. `cd backend && npm install`
3. `cd frontend && npm install`
4. Setup `.env` files using `.env.example` as a template.
5. Run backend: `npm run dev`
6. Run frontend: `npm run dev`

## Deployment Guide
- Frontend deploys automatically via Netlify.
- Backend deploys via Render, triggered by GitHub actions.
