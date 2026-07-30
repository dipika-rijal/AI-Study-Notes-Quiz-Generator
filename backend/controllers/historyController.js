const Note = require("../models/Note.js");
const Quiz = require("../models/Quiz.js");
const QuizAttempt = require("../models/QuizAttempt.js");
const Conversation = require("../models/Conversation.js");

async function getHistory(req, res, next) {
  try {
  const filter = req.query.type || "all";

  const [notes, quizzes, attempts, conversations] = await Promise.all([
    Note.find({ userId: req.user.uid }).sort({ updatedAt: -1 }).lean(),
    Quiz.find({ userId: req.user.uid }).sort({ createdAt: -1 }).lean(),
    QuizAttempt.find({ userId: req.user.uid }).sort({ createdAt: -1 }).lean(),
    Conversation.find({ userId: req.user.uid }).sort({ updatedAt: -1 }).lean()
  ]);

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
      updatedAt: attempt.updatedAt,
      status: attempt.status || "completed",
      results: attempt.feedback || [],
      quizId: attempt.quizId ? String(attempt.quizId) : null
    };
  });

  const conversationItems = conversations.map(function (conv) {
    let preview = conv.topic || "Conversation";
    if (conv.messages && conv.messages.length > 0) {
      const lastMsg = conv.messages[conv.messages.length - 1];
      const lastQuiz = [...conv.messages].reverse().find(function (message) {
        return message.type === "quiz" && message.quizState && message.quizState.submitted;
      });
      const quizResult = lastMsg.quizResult || (lastMsg.type === "quiz" ? lastMsg.quizState : lastQuiz?.quizState);

      if (quizResult && quizResult.score !== undefined && quizResult.totalQuestions !== undefined) {
        const quizMessage = lastMsg.type === "quiz" ? lastMsg : lastQuiz;
        const topic = quizResult.topic || quizMessage?.data?.topic || quizMessage?.topic || conv.topic || "Study quiz";
        preview = "Quiz: " + topic + " — " + quizResult.score + "/" + quizResult.totalQuestions;
      } else if (lastMsg.type === "text") {
        preview = lastMsg.content.substring(0, 100) + (lastMsg.content.length > 100 ? "..." : "");
      } else if (lastMsg.type === "quiz") {
        preview = "Quiz generated.";
      } else if (lastMsg.type === "notes") {
        preview = "Notes generated.";
      }
    }

    return {
      id: String(conv._id),
      type: "conversation",
      historyKind: "chat",
      title: conv.title || "Study Session",
      subtitle: conv.topic || "Chat Session",
      description: preview,
      scoreText: null,
      questionCount: null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    };
  });

  let items = [];

  if (filter === "notes") {
    items = noteItems;
  } else if (filter === "quizzes") {
    items = quizItems.concat(attemptItems);
  } else if (filter === "conversations") {
    items = conversationItems;
  } else {
    items = noteItems.concat(quizItems).concat(attemptItems).concat(conversationItems);
  }

  items.sort(function (a, b) {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  res.status(200).json({
    success: true,
    counts: {
      all: noteItems.length + quizItems.length + attemptItems.length + conversationItems.length,
      notes: noteItems.length,
      quizzes: quizItems.length + attemptItems.length,
      savedQuizzes: quizItems.length,
      quizAttempts: attemptItems.length,
      conversations: conversationItems.length
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

  const notes = await Note.find({ userId: req.user.uid }).sort({ updatedAt: -1 }).limit(limit).lean();
  const quizzes = await Quiz.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(limit).lean();
  const attempts = await QuizAttempt.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(limit).lean();

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
      updatedAt: attempt.updatedAt,
      status: attempt.status || "completed",
      results: attempt.feedback || [],
      quizId: attempt.quizId ? String(attempt.quizId) : null
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

async function clearHistory(req, res, next) {
  try {
    const filter = { userId: req.user.uid };
    const [notes, quizzes, attempts, conversations] = await Promise.all([
      Note.deleteMany(filter),
      Quiz.deleteMany(filter),
      QuizAttempt.deleteMany(filter),
      Conversation.deleteMany(filter)
    ]);

    res.status(200).json({
      success: true,
      deleted: notes.deletedCount + quizzes.deletedCount + attempts.deletedCount + conversations.deletedCount
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHistory,
  getRecentActivity,
  clearHistory
};

