StudyGen AI

StudyGen AI is an application that generates AI-powered study notes, quizzes, and flashcards from your existing study material.

Features
Automated Study Notes: Generate detailed, multi-level notes based on a topic or pasted text.
AI-driven Quizzes: Create focused practice sets on specific subjects with automated grading and explanations.
Flashcards: Turn notes into swipeable flashcards with mastery tracking.
AI Tutor & Planner: Conversational tutoring and AI-generated study plans.
Document Summarization: Upload and summarize PDFs.
Streak & History: Track your daily learning streaks and review past notes, quizzes, and conversations.
Secure Authentication: User accounts backed by Firebase.
Tech Stack
Frontend: React 19, Vite, Tailwind CSS, Zustand, React Query
Backend: Node.js, Express 5, MongoDB Atlas (Mongoose)
Authentication: Firebase Auth (client) + Firebase Admin SDK (server-side token verification)
AI Engine: Groq API (Llama 3)
Testing: Node Native Test Runner (Backend), Vitest & Testing Library (Frontend)
Requirements
Node.js version 18 or higher
A MongoDB Atlas cluster
A Firebase project (with a generated Admin SDK service account key)
A Groq API key
Setup Instructions
Firebase Setup
Create a Firebase project at console.firebase.google.com.
Enable Authentication and turn on the sign-in methods you need (e.g. Email/Password).
Under Project Settings → General, copy your web app config values into frontend/.env.
Under Project Settings → Service accounts, generate a new private key (downloads a JSON file). This is required by the backend's Firebase Admin SDK to verify auth tokens — stringify the JSON and set it as FIREBASE_SERVICE_ACCOUNT in backend/.env.
Groq API Key Setup
Go to console.groq.com.
Generate an API key and add it to backend/.env as GROQ_API_KEY.
MongoDB Atlas Setup
Create a cluster on MongoDB Atlas.
Under Network Access, whitelist your IP address or 0.0.0.0/0.
Get the connection string and place it into backend/.env as MONGODB_URI.
Environment Variables

backend/.env

PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string_here
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_SERVICE_ACCOUNT=your_firebase_admin_service_account_json_here

frontend/.env

VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
Installation Guide
Clone the repository.
cd backend && npm install
cd frontend && npm install
Set up .env files using .env.example as a starting template in both frontend and backend directories (see Environment Variables above for the full list, including FIREBASE_SERVICE_ACCOUNT).
Run backend: cd backend && npm run dev
Run frontend: cd frontend && npm run dev
Running Tests

Both frontend and backend include lightweight, high-signal test suites.

Backend Tests (Native Node Test Runner)

bash
cd backend
npm test

Tests core utilities like streakUtils.js and standard API response formats.

Frontend Tests (Vitest)

bash
cd frontend
npm test

Tests critical components such as ErrorBoundary, design-system components (Badge, Button), and utility functions like flashcards.js and exportChatPdf.js.

Deployment
Frontend deploys automatically to Vercel on push (see frontend/vercel.json).
Backend deploys to Render, triggered by GitHub Actions.
On Render, make sure all backend/.env variables above are set as environment variables in the service's dashboard — in particular FIREBASE_SERVICE_ACCOUNT, since a missing or malformed value here is a common cause of login failures in production.
Set CLIENT_URL in the backend's Render env vars to your deployed Vercel URL, and VITE_API_BASE_URL in the frontend's Vercel env vars to your deployed Render backend URL.
For cross-domain auth cookies to work between the Vercel frontend and Render backend, ensure the session cookie is set with sameSite: "none" and secure: true in backend/routes/authRoutes.js.
