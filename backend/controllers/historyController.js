const Note = require("../models/Note.js");
const Quiz = require("../models/Quiz.js");
const QuizAttempt = require("../models/QuizAttempt.js");

async function getHistory(req, res, next) {
  try {
    const filter = req.query.type || "all";

    const notes = await Note.find().sort({ updatedAt: -1 }).lean();
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
    const attempts = await QuizAttempt.find().sort({ createdAt: -1 }).lean();

    const noteItems = notes.map(function (note) {
      return {
        id: String(note._id),
        type: "note",
        title: note.title,
        subtitle: note.category || "General",
        description: note.summary || note.body || "",
        scoreText: null,
        questionCount: null,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };
    });

    const quizItems = quizzes.map(function (quiz) {
      return {
        id: String(quiz._id),
        type: "quiz",
        historyKind: "saved-quiz",
        title: quiz.topic,
        subtitle: "Saved quiz",
        description: quiz.content || "Saved quiz",
        scoreText: null,
        questionCount: quiz.questions ? quiz.questions.length : 0,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      };
    });

    const attemptItems = attempts.map(function (attempt) {
      return {
        id: String(attempt._id),
        type: "quiz",
        historyKind: "quiz-attempt",
        title: attempt.topic,
        subtitle: "Quiz attempt",
        description: "Practice record",
        scoreText: attempt.score + "/" + attempt.totalQuestions,
        questionCount: attempt.totalQuestions,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt
      };
    });

    let items = [];

    if (filter === "notes") {
      items = noteItems;
    } else if (filter === "quizzes") {
      items = quizItems.concat(attemptItems);
    } else {
      items = noteItems.concat(quizItems).concat(attemptItems);
    }

    items.sort(function (a, b) {
      return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
    });

    res.status(200).json({
      success: true,
      counts: {
        all: noteItems.length + quizItems.length + attemptItems.length,
        notes: noteItems.length,
        quizzes: quizItems.length + attemptItems.length,
        savedQuizzes: quizItems.length,
        quizAttempts: attemptItems.length
      },
      items: items
    });
  } catch (error) {
    next(error);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 5;

    const notes = await Note.find().sort({ updatedAt: -1 }).limit(limit).lean();
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(limit).lean();
    const attempts = await QuizAttempt.find().sort({ createdAt: -1 }).limit(limit).lean();

    const items = [];

    notes.forEach(function (note) {
      items.push({
        id: String(note._id),
        type: "note",
        title: note.title,
        subtitle: note.category || "General",
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      });
    });

    quizzes.forEach(function (quiz) {
      items.push({
        id: String(quiz._id),
        type: "quiz",
        historyKind: "saved-quiz",
        title: quiz.topic,
        subtitle: (quiz.questions ? quiz.questions.length : 0) + " questions",
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      });
    });

    attempts.forEach(function (attempt) {
      items.push({
        id: String(attempt._id),
        type: "quiz",
        historyKind: "quiz-attempt",
        title: attempt.topic,
        subtitle: attempt.score + "/" + attempt.totalQuestions,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt
      });
    });

    items.sort(function (a, b) {
      return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
    });

    res.status(200).json({
      success: true,
      items: items.slice(0, limit)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHistory,
  getRecentActivity
};

