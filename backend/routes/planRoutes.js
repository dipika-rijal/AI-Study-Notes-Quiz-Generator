const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Phase 3 routes
router.post("/generate", planController.generatePlan);
router.get("/", planController.getPlans);
router.get("/:id", planController.getPlanById);
router.put("/:id/progress", planController.updatePlanProgress);
router.delete("/:id", planController.deletePlan);

// Legacy backward compat
router.put("/task", planController.updateTaskStatus);

module.exports = router;
