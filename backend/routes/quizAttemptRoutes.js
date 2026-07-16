const express = require("express");
const router = express.Router();

const {
  getQuizAttempts,
  createQuizAttempt,
  updateQuizAttempt,
  deleteQuizAttempt
} = require("../controllers/quizAttemptController.js");

router.get("/", getQuizAttempts);
router.post("/", createQuizAttempt);
router.put("/:id", updateQuizAttempt);
router.delete("/:id", deleteQuizAttempt);

module.exports = router;

