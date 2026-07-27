const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");

router.use(requireAuth);

const {
  getQuizAttempts,
  getQuizAttemptById,
  createQuizAttempt,
  updateQuizAttempt,
  deleteQuizAttempt
} = require("../controllers/quizAttemptController.js");

router.get("/", getQuizAttempts);
router.get("/:id", getQuizAttemptById);
router.post("/", createQuizAttempt);
router.put("/:id", updateQuizAttempt);
router.delete("/:id", deleteQuizAttempt);

module.exports = router;

