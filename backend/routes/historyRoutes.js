const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");

router.use(requireAuth);

const {
  getHistory,
  getRecentActivity
} = require("../controllers/historyController.js");

router.get("/", getHistory);
router.get("/recent", getRecentActivity);

module.exports = router;

