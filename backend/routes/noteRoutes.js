const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.js");

router.use(requireAuth);

const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} = require("../controllers/noteController.js");

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;

