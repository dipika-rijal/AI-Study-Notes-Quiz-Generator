const express = require("express");
const router = express.Router();

const {
  getQuizAttempts,
  createQuizAttempt
} = require("../controllers/quizAttemptController.cjs");

router.get("/", getQuizAttempts);
router.post("/", createQuizAttempt);

module.exports = router;
