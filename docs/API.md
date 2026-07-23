# StudyGen AI API Documentation

Base URL: `http://localhost:5000/api`

## Authentication
Most API endpoints require authentication using a Firebase Token.
Header format: `Authorization: Bearer <FIREBASE_TOKEN>`

## Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Notes
- `GET /api/notes` - Get all generated notes for the user
- `POST /api/notes/generate` - Generate new study notes

### Quizzes
- `GET /api/quizzes` - Get generated quizzes
- `POST /api/quizzes/generate` - Generate a new quiz
- `POST /api/quizzes/submit` - Submit quiz answers

### History & Streak
- `GET /api/history` - Get user activity history
- `GET /api/streak` - Get current streak info
