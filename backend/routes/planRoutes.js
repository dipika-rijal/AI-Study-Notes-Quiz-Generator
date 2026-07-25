const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const { protect } = require("../middleware/authMiddleware");
const { strictLimiter } = require("../middleware/rateLimit");

router.use(protect);

// Phase 3 routes
router.post("/generate", strictLimiter, planController.validatePlan, planController.generatePlan);
router.get("/", planController.getPlans);
router.get("/:id", planController.getPlanById);
router.put("/:id/progress", planController.updatePlanProgress);
router.delete("/:id", planController.deletePlan);


module.exports = router;
