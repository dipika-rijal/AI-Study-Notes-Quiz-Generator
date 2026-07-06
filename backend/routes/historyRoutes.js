const express = require("express");
const router = express.Router();

const {
  getHistory,
  getRecentActivity
} = require("../controllers/historyController.js");

router.get("/", getHistory);
router.get("/recent", getRecentActivity);

module.exports = router;

