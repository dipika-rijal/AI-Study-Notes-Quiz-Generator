const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.js");

const noteRoutes = require("./routes/noteRoutes.js");
const quizRoutes = require("./routes/quizRoutes.js");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes.js");
const historyRoutes = require("./routes/historyRoutes.js");
const conversationRoutes = require("./routes/conversationRoutes.js");

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", function (req, res) {
  res.json({
    success: true,
    message: "StudyGen backend is running"
  });
});

app.use("/api/notes", noteRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/conversations", conversationRoutes);

app.use(function (req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(function (error, req, res, next) {
  console.error(error);
  res.status(500).json({
    success: false,
    message: error.message || "Server error"
  });
});

connectDB()
  .then(function () {
    app.listen(PORT, function () {
      console.log("StudyGen backend running on http://localhost:" + PORT);
    });
  })
  .catch(function (error) {
    console.error(error);
    process.exit(1);
  });

