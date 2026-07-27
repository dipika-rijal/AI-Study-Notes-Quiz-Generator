const { body, validationResult } = require("express-validator");

const req1 = { body: { goal: "ml", subjects: ["ml"], examDate: "2026-07-29", availableHours: 2, currentLevel: "beginner", weakTopics: ["svm"] } };
const req2 = { body: { goal: "ml", subjects: ["ml"], examDate: "07/29/2026", availableHours: 2, currentLevel: "beginner", weakTopics: ["svm"] } };
const req3 = { body: { goal: "ml", subjects: ["ml"], examDate: "2026-07-29T00:00:00.000Z", availableHours: 2, currentLevel: "beginner", weakTopics: ["svm"] } };

const validatePlan = [
  body("goal").trim().notEmpty().escape().isLength({ max: 500 }),
  body("subjects").optional().isArray({ max: 50 }),
  body("examDate").custom((val) => !isNaN(Date.parse(val))).withMessage("Invalid date"),
  body("availableHours").optional().isFloat({ min: 0.5, max: 24 }),
  body("currentLevel").optional().isIn(["beginner", "intermediate", "advanced"]),
  body("weakTopics").optional().isArray({ max: 100 })
];

async function runTest(req, num) {
  for (let validation of validatePlan) {
    await validation.run(req);
  }
  const errors = validationResult(req);
  console.log(`Test ${num} errors:`, errors.array());
}

async function main() {
  await runTest(req1, 1);
  await runTest(req2, 2);
  await runTest(req3, 3);
}

main();
