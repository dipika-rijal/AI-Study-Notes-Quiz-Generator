const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");

router.use(requireAuth);
const { getStreak } = require("../controllers/streakController");

router.get("/", getStreak);

module.exports = router;
