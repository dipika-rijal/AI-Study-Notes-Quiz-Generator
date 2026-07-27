const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");
const { generateChatCompletion, streamAIChatResponse } = require("../controllers/conversationAiController.js");
const { strictLimiter } = require("../middleware/rateLimit.js");

router.use(requireAuth);

router.post("/chat/complete", strictLimiter, generateChatCompletion);
router.post("/chat/stream", strictLimiter, streamAIChatResponse);

module.exports = router;
