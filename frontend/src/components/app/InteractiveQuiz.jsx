import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import QuizReview from "./QuizReview";
import QuizOption from "./QuizOption";
import ProgressBar from "../ui/ProgressBar";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/api\/?$/, "");

const OPTION_LETTERS = ["A", "B", "C", "D"];

function normalizeQuestions(data) {
  const questions = Array.isArray(data)
    ? data
    : Array.isArray(data?.questions)
    ? data.questions
    : [];

  return questions.map((question, index) => {
    const options = Array.isArray(question.options) ? question.options.slice(0, 4) : [];
    const correctAnswer =
      question.correctAnswer ||
      question.answerLetter ||
      OPTION_LETTERS[options.indexOf(question.answer)] ||
      "A";

    return {
      id: question.id || question._id || `${data?.quizId || "quiz"}-${index}`,
      question: question.question || question.questionText || `Question ${index + 1}`,
      options,
      correctAnswer,
      explanation:
        typeof question.explanation === "object"
          ? question.explanation
          : {
              correct: question.explanation || "This is the correct answer.",
              wrong: {}
            }
    };
  });
}

function normalizeState(initialState) {
  if (
    initialState &&
    !initialState.selectedAnswers &&
    Object.values(initialState).some((value) => typeof value === "string")
  ) {
    const selectedAnswers = {};
    Object.entries(initialState).forEach(([index, value]) => {
      selectedAnswers[index] = { selectedAnswer: value };
    });
    return { selectedAnswers };
  }

  return initialState || {};
}

function selectedLetterFor(question, answerRecord) {
  const selected = answerRecord?.selectedAnswer ?? answerRecord;
  if (OPTION_LETTERS.includes(selected)) return selected;
  const selectedIndex = question.options.indexOf(selected);
  return selectedIndex >= 0 ? OPTION_LETTERS[selectedIndex] : "";
}

function optionExplanation(question, letter) {
  if (letter === question.correctAnswer) {
    return question.explanation?.correct || "This is the correct answer.";
  }
  return (
    question.explanation?.wrong?.[letter] ||
    "This option does not best answer the question."
  );
}

export default function InteractiveQuiz({ data, initialAnswers = {}, onAnswerUpdate }) {
  const questions = useMemo(() => normalizeQuestions(data), [data]);
  const restoredState = normalizeState(initialAnswers);

  const [selectedAnswers, setSelectedAnswers] = useState(
    restoredState.selectedAnswers || {}
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    restoredState.currentQuestionIndex || 0
  );
  const [submitted, setSubmitted] = useState(Boolean(restoredState.submitted));
  const [openedExplanations] = useState(
    restoredState.openedExplanations || {}
  );
  const [score, setScore] = useState(restoredState.score ?? null);
  const [feedback, setFeedback] = useState(restoredState.feedback || null);
  const [attemptId, setAttemptId] = useState(restoredState.attemptId || null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSaved, setIsSaved] = useState(restoredState.isSaved || false);

  useEffect(() => {
    onAnswerUpdate?.({
      selectedAnswers,
      currentQuestionIndex,
      submitted,
      openedExplanations,
      attemptId,
      score,
      feedback,
      isSaved
    });
  }, [
    selectedAnswers,
    currentQuestionIndex,
    submitted,
    openedExplanations,
    attemptId,
    score,
    feedback,
    isSaved,
    onAnswerUpdate
  ]);

  if (!questions.length) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 text-amber-800 dark:text-amber-400 text-sm font-medium">
        No quiz questions found in this response.
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  function chooseAnswer(index, letter) {
    if (submitted) return;
    setSelectedAnswers((previous) => ({
      ...previous,
      [index]: { selectedAnswer: letter }
    }));
  }

  function goToQuestion(index) {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, totalQuestions - 1)));
  }

  function buildLocalFeedback() {
    return questions.map((question, index) => {
      const selectedLetter = selectedLetterFor(question, selectedAnswers[index]);
      const selectedIndex = OPTION_LETTERS.indexOf(selectedLetter);
      const correctIndex = OPTION_LETTERS.indexOf(question.correctAnswer);

      return {
        questionId: question.id,
        questionText: question.question,
        selectedOptionIndex: selectedIndex >= 0 ? selectedIndex : null,
        selectedOptionText:
          selectedIndex >= 0 ? question.options[selectedIndex] : "Not answered",
        selectedOptionExplanation:
          selectedIndex >= 0
            ? optionExplanation(question, selectedLetter)
            : "You did not select an answer for this question.",
        correctOptionIndex: correctIndex,
        correctOptionText: question.options[correctIndex],
        correctOptionExplanation: question.explanation?.correct || "",
        isCorrect: selectedLetter === question.correctAnswer
      };
    });
  }

  async function submitQuiz() {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);
    setSubmitError("");

    const localFeedback = buildLocalFeedback();
    const localScore = localFeedback.filter((item) => item.isCorrect).length;

    setScore(localScore);
    setFeedback(localFeedback);
    setIsSaved(false);
    setSubmitted(true);
    setIsSubmitting(false);
  }

  async function handleSaveAttempt() {
    if (!data?.quizId) return;
    
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const selectedPayload = questions.map((question, index) => {
        const selectedLetter = selectedLetterFor(question, selectedAnswers[index]);
        const selectedOptionIndex = OPTION_LETTERS.indexOf(selectedLetter);
        return {
          questionId: question.id,
          selectedOptionIndex: selectedOptionIndex >= 0 ? selectedOptionIndex : null
        };
      });

      const response = await fetch(`${API_BASE_URL}/api/quiz-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: data.quizId,
          selectedAnswers: selectedPayload
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save attempt.");

      setAttemptId(result.attempt?._id || null);
      setIsSaved(true);
    } catch (error) {
      setSubmitError(error.message || "Failed to save attempt.");
      setIsSaved(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnsaveAttempt() {
    if (!attemptId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz-attempts/${attemptId}`, { method: "DELETE" });
      if (response.ok) {
        setIsSaved(false);
      }
    } catch (err) {
      console.error("Failed to unsave attempt", err);
    }
  }

  function handleSubmitClick() {
    if (answeredCount < totalQuestions) {
      setShowSubmitConfirm(true);
      return;
    }
    submitQuiz();
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-6 md:p-8 shadow-sm">
      {!submitted ? (
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Progress */}
            <ProgressBar 
              current={currentQuestionIndex + 1} 
              total={totalQuestions} 
              label="Question" 
            />

            {/* Question */}
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-medium text-[var(--theme-text-primary)] leading-relaxed">
                {currentQuestion.question}
              </h3>
              
              {/* Options */}
              <div className="grid gap-3">
                {currentQuestion.options.map((option, optionIndex) => {
                  const letter = OPTION_LETTERS[optionIndex];
                  const selectedLetter = selectedLetterFor(currentQuestion, selectedAnswers[currentQuestionIndex]);
                  const isSelected = selectedLetter === letter;

                  return (
                    <QuizOption
                      key={letter}
                      option={option}
                      index={optionIndex}
                      isSelected={isSelected}
                      isCorrect={false}
                      isWrong={false}
                      onClick={() => chooseAnswer(currentQuestionIndex, letter)}
                      disabled={false}
                    />
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-[var(--theme-glass-border)]">
              <button
                type="button"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-3">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToQuestion(currentQuestionIndex + 1)}
                    className="px-6 py-2.5 rounded-xl border border-[var(--theme-glass-border)] text-sm font-medium text-[var(--theme-text-primary)] hover:border-[var(--color-border-hover)] transition-colors shadow-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={isSubmitting}
                    className="px-8 py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-medium hover:bg-[var(--color-primary-600)] disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>

            {/* Confirm Submit Dialog */}
            {showSubmitConfirm && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] space-y-4"
              >
                <p className="text-sm font-medium text-[var(--color-warning-text)]">
                  You have {totalQuestions - answeredCount} unanswered questions. Submit anyway?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-[var(--theme-bg-secondary)] border border-[var(--color-warning-border)] text-sm font-medium text-[var(--theme-text-primary)]"
                  >
                    Continue Quiz
                  </button>
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className="px-4 py-2 rounded-lg bg-[var(--color-warning-text)] text-[var(--theme-bg-primary)] text-sm font-medium"
                  >
                    Submit Anyway
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <QuizReview 
          quiz={{ questions }}
          answers={feedback || []}
          score={score ?? 0}
          totalQuestions={totalQuestions}
          attemptId={attemptId}
          isSaved={isSaved}
          onSave={handleSaveAttempt}
          onUnsave={handleUnsaveAttempt}
        />
      )}
    </div>
  );
}
