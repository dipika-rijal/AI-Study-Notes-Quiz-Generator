const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");
const preferenceController = require("../controllers/preferenceController.js");

router.use(requireAuth);

const { body, validationResult } = require("express-validator");

const validatePreferences = [
  body("theme").optional().isString().trim(),
  body("accent").optional().isString().trim(),
  body("learningProfile.weaknesses").optional().isArray(),
  body("learningProfile.weaknesses.*").optional().isString().trim(),
  body("learningProfile.strengths").optional().isArray(),
  body("learningProfile.strengths.*").optional().isString().trim(),
  body("learningProfile.preferredStyle").optional().isString().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

router.get("/", preferenceController.getPreferences);
router.put("/", validatePreferences, preferenceController.updatePreferences);

module.exports = router;
