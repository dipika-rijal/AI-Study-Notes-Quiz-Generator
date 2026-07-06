const Note = require("../models/Note.js");

async function getNotes(req, res, next) {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json({ success: true, total: notes.length, notes: notes });
  } catch (error) {
    next(error);
  }
}

async function getNoteById(req, res, next) {
  try {
    const note = await Note.findById(req.params.id);

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
    const note = await Note.create(req.body);
    res.status(201).json({ success: true, message: "Note created", note: note });
  } catch (error) {
    next(error);
  }
}

async function updateNote(req, res, next) {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
    const note = await Note.findByIdAndDelete(req.params.id);

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
  deleteNote
};

