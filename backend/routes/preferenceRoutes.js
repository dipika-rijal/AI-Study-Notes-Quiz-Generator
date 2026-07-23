const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");
const preferenceController = require("../controllers/preferenceController.js");

router.use(requireAuth);

router.get("/", preferenceController.getPreferences);
router.put("/", preferenceController.updatePreferences);

module.exports = router;
