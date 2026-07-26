const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");
const { generateChatCompletion, streamAIChatResponse } = require("../controllers/conversationAiController.js");
const { generalLimiter } = require("../middleware/rateLimit.js");

router.use(requireAuth);

router.post("/chat/complete", generalLimiter, generateChatCompletion);
router.post("/chat/stream", generalLimiter, streamAIChatResponse);

module.exports = router;
