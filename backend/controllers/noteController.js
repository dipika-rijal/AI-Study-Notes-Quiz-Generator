const Note = require("../models/Note.js");
const { body, validationResult } = require("express-validator");

const validateNote = [
  body("title").trim().notEmpty().isLength({ max: 200 }),
  body("body").notEmpty(),
  body("category").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

async function getNotes(req, res, next) {
  try {
    const notes = await Note.find({ userId: req.user.uid }).sort({ updatedAt: -1 });
    res.json({ success: true, total: notes.length, notes: notes });
  } catch (error) {
    next(error);
  }
}

async function getNoteById(req, res, next) {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.uid });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.json({ success: true, note: note });
  } catch (error) {
    next(error);
  }
}

async function createNote(req, res, next) {
  try {
    const note = await Note.create({ ...req.body, userId: req.user.uid });
    res.status(201).json({ success: true, message: "Note created", note: note });
  } catch (error) {
    next(error);
  }
}

async function updateNote(req, res, next) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.json({ success: true, message: "Note updated", note: note });
  } catch (error) {
    next(error);
  }
}

async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  validateNote
};

