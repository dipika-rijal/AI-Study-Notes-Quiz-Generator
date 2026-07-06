const Quiz = require("../models/Quiz.js");
const QuizAttempt = require("../models/QuizAttempt.js");

async function getQuizAttempts(req, res, next) {
  try {
    const attempts = await QuizAttempt.find()
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
      score: score
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

module.exports = {
  getQuizAttempts,
  createQuizAttempt
};

