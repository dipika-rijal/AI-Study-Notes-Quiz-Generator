const express = require("express");
const router = express.Router();

const {
  getQuizzes,
  getQuizById,
  createQuiz,
  generateQuiz,
  retryQuiz,
  checkAnswer,
  updateQuiz,
  deleteQuiz
} = require("../controllers/quizController.js");

router.post("/generate", generateQuiz);
router.post("/retry", retryQuiz);
router.post("/check-answer", checkAnswer);
router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

module.exports = router;

