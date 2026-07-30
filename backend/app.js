const express = require("express");
const cors = require("cors");
require("dotenv").config();

const validateEnv = require("./config/validateEnv");
validateEnv();

const helmet = require("helmet");
const connectDB = require("./config/db.js");
const { generalLimiter } = require("./middleware/rateLimit");

const noteRoutes = require("./routes/noteRoutes.js");
const quizRoutes = require("./routes/quizRoutes.js");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes.js");
const historyRoutes = require("./routes/historyRoutes.js");
const conversationRoutes = require("./routes/conversationRoutes.js");
const preferenceRoutes = require("./routes/preferenceRoutes.js");
const streakRoutes = require("./routes/streakRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);

  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[RES] ${req.method} ${req.url} -> ${res.statusCode}`);

    if (
      res.statusCode >= 400 &&
      process.env.FRONTEND_ENV 
    ) {
      console.log("[RES BODY]", body);
    }

    return originalSend.call(this, body);
  };

  next();
});

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin === CLIENT_URL ||
        (process.env.NODE_ENV === "development" &&
          origin.startsWith("http://localhost:"))
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Rate limiter
app.use("/api", generalLimiter);

// Health route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StudyGen backend is running",
  });
});

// Routes
app.use("/api/notes", noteRoutes);
// Keep the former singular path during the client migration. This prevents
// deployed or cached clients from receiving a 404 while new code uses
// the canonical plural /api/quizzes path.
app.use("/api/quiz", quizRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/ai", aiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  const isDev = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
});

// Start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`StudyGen backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
