const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ""
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    selectedAnswers: {
      type: Array,
      required: true
    },
    correctAnswers: {
      type: Array,
      required: true
    },
    feedback: {
      type: Array,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "completed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);

