const Quiz = require("../models/Quiz.js");
const QuizAttempt = require("../models/QuizAttempt.js");

async function getQuizAttempts(req, res, next) {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .populate("quizId", "topic difficulty");

    res.json({ success: true, total: attempts.length, attempts: attempts });
  } catch (error) {
    next(error);
  }
}

async function createQuizAttempt(req, res, next) {
  try {
    const quizId = req.body.quizId;
    const selectedAnswers = req.body.selectedAnswers;

    if (!quizId || !Array.isArray(selectedAnswers)) {
      return res.status(400).json({
        success: false,
        message: "quizId and selectedAnswers are required"
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let score = 0;

    const feedback = quiz.questions.map(function (question) {
      const userAnswer = selectedAnswers.find(function (answer) {
        return String(answer.questionId) === String(question._id);
      });

      const selectedOptionIndex =
        userAnswer && userAnswer.selectedOptionIndex !== undefined
          ? Number(userAnswer.selectedOptionIndex)
          : null;

      const correctOptionIndex = question.options.findIndex(function (option) {
        return option.isCorrect;
      });

      const selectedOption =
        selectedOptionIndex !== null ? question.options[selectedOptionIndex] : null;

      const correctOption = question.options[correctOptionIndex];

      const isCorrect = selectedOptionIndex === correctOptionIndex;

      if (isCorrect) {
        score = score + 1;
      }

      return {
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,

        selectedOptionIndex: selectedOptionIndex,
        selectedOptionText: selectedOption ? selectedOption.text : "Not answered",
        selectedOptionExplanation: selectedOption
          ? selectedOption.explanation
          : "You did not select an answer for this question.",

        correctOptionIndex: correctOptionIndex,
        correctOptionText: correctOption.text,
        correctOptionExplanation: correctOption.explanation,

        isCorrect: isCorrect
      };
    });

    const correctAnswers = feedback.map(function (item) {
      return {
        questionId: item.questionId,
        questionText: item.questionText,
        correctOptionIndex: item.correctOptionIndex,
        correctOptionText: item.correctOptionText,
        correctOptionExplanation: item.correctOptionExplanation
      };
    });

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      topic: quiz.topic,
      content: quiz.content,
      totalQuestions: quiz.questions.length,
      selectedAnswers: selectedAnswers,
      correctAnswers: correctAnswers,
      feedback: feedback,
      score: score,
      status: req.body.status || "completed",
      userId: req.user.uid
    });

    res.status(201).json({
      success: true,
      message: "Quiz attempt saved successfully",
      attempt: attempt
    });
  } catch (error) {
    next(error);
  }
}

async function updateQuizAttempt(req, res, next) {
  try {
    const { id } = req.params;
    
    // Feature: Rename quiz attempt (updates topic only)
    if (req.body.topic !== undefined) {
      if (!req.body.topic.trim()) {
        return res.status(400).json({ success: false, message: "Topic is required" });
      }
      const attempt = await QuizAttempt.findOneAndUpdate(
        { _id: id, userId: req.user.uid },
        { topic: req.body.topic.trim() },
        { new: true, runValidators: true }
      );
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }
      return res.json({ success: true, message: "Attempt updated", attempt });
    }

    const { selectedAnswers, status } = req.body;

    if (!Array.isArray(selectedAnswers)) {
      return res.status(400).json({
        success: false,
        message: "selectedAnswers is required and must be an array"
      });
    }

    const attempt = await QuizAttempt.findOne({ _id: id, userId: req.user.uid });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let score = 0;

    const feedback = quiz.questions.map(function (question) {
      const userAnswer = selectedAnswers.find(function (answer) {
        return String(answer.questionId) === String(question._id);
      });

      const selectedOptionIndex =
        userAnswer && userAnswer.selectedOptionIndex !== undefined
          ? Number(userAnswer.selectedOptionIndex)
          : null;

      const correctOptionIndex = question.options.findIndex(function (option) {
        return option.isCorrect;
      });

      const selectedOption =
        selectedOptionIndex !== null ? question.options[selectedOptionIndex] : null;

      const correctOption = question.options[correctOptionIndex];

      const isCorrect = selectedOptionIndex === correctOptionIndex;

      if (isCorrect) {
        score = score + 1;
      }

      return {
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,

        selectedOptionIndex: selectedOptionIndex,
        selectedOptionText: selectedOption ? selectedOption.text : "Not answered",
        selectedOptionExplanation: selectedOption
          ? selectedOption.explanation
          : "You did not select an answer for this question.",

        correctOptionIndex: correctOptionIndex,
        correctOptionText: correctOption.text,
        correctOptionExplanation: correctOption.explanation,

        isCorrect: isCorrect
      };
    });

    const correctAnswers = feedback.map(function (item) {
      return {
        questionId: item.questionId,
        questionText: item.questionText,
        correctOptionIndex: item.correctOptionIndex,
        correctOptionText: item.correctOptionText,
        correctOptionExplanation: item.correctOptionExplanation
      };
    });

    attempt.selectedAnswers = selectedAnswers;
    attempt.correctAnswers = correctAnswers;
    attempt.feedback = feedback;
    attempt.score = score;
    attempt.status = status || attempt.status;

    await attempt.save();

    res.json({
      success: true,
      message: "Quiz attempt updated successfully",
      attempt: attempt
    });
  } catch (error) {
    next(error);
  }
}

async function deleteQuizAttempt(req, res, next) {
  try {
    const attempt = await QuizAttempt.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }
    res.json({ success: true, message: "Quiz attempt deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuizAttempts,
  createQuizAttempt,
  updateQuizAttempt,
  deleteQuizAttempt
};
