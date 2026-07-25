const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");

router.use(requireAuth);

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

const { strictLimiter } = require("../middleware/rateLimit.js");

router.post("/generate", strictLimiter, generateQuiz);
router.post("/retry", strictLimiter, retryQuiz);
router.post("/check-answer", checkAnswer);
router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

module.exports = router;


