const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");

router.use(requireAuth);
const {
  saveConversation,
  getConversation,
  deleteConversation,
  getConversations
} = require("../controllers/conversationController");

router.get("/", getConversations);
router.get("/:id", getConversation);
router.put("/:id", saveConversation);
router.delete("/:id", deleteConversation);

module.exports = router;
