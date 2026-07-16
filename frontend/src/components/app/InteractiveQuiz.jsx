import { useEffect, useMemo, useState } from "react";
import QuizReview from "./QuizReview";

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

function inferAreas(questions, selectedAnswers) {
  const strong = [];
  const weak = [];

  questions.forEach((question, index) => {
    const selectedLetter = selectedLetterFor(question, selectedAnswers[index]);
    const target = selectedLetter === question.correctAnswer ? strong : weak;
    const words = question.question
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 3)
      .join(" ");

    if (words) target.push(words);
  });

  return {
    strong: [...new Set(strong)].slice(0, 4),
    weak: [...new Set(weak)].slice(0, 4)
  };
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
  const [openedExplanations, setOpenedExplanations] = useState(
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
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-semibold">
        No quiz questions found in this response.
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const percentage = score === null ? 0 : Math.round((score / totalQuestions) * 100);
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const areas = submitted ? inferAreas(questions, selectedAnswers) : { strong: [], weak: [] };

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

  function toggleExplanation(index) {
    setOpenedExplanations((previous) => ({
      ...previous,
      [index]: !previous[index]
    }));
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

  function renderOption(question, questionIndex, option, optionIndex) {
    const letter = OPTION_LETTERS[optionIndex];
    const selectedLetter = selectedLetterFor(question, selectedAnswers[questionIndex]);
    const isSelected = selectedLetter === letter;
    const isCorrect = question.correctAnswer === letter;

    let style =
      "bg-white border-purple-100 hover:bg-[#fff5ec] hover:border-[#6757ff] text-[#15132b]";

    if (submitted) {
      if (isCorrect) {
        style = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
      } else if (isSelected) {
        style = "bg-red-50 border-red-200 text-red-700 font-bold";
      } else {
        style = "bg-white border-purple-50 text-gray-500";
      }
    } else if (isSelected) {
      style = "bg-[#6757ff]/10 border-[#6757ff] text-[#15132b] font-bold";
    }

    return (
      <button
        key={letter}
        type="button"
        onClick={() => chooseAnswer(questionIndex, letter)}
        disabled={submitted}
        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold border transition ${style}`}
      >
        <span className="font-black mr-2">{letter}.</span>
        {option}
      </button>
    );
  }

  return (
    <div className="w-full rounded-3xl border border-purple-100 bg-white p-5 shadow-sm shadow-purple-50 space-y-5 select-none">
      <div className="flex flex-col gap-3 border-b border-purple-50 pb-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#6757ff]">
            Interactive Quiz
          </span>
          <span className="text-xs font-semibold text-[#8a83a5]">
            {submitted
              ? `Score: ${score ?? 0}/${totalQuestions} (${percentage}%)`
              : `Question ${currentQuestionIndex + 1} of ${totalQuestions} | Answered: ${answeredCount}/${totalQuestions}`}
          </span>
        </div>

        {!submitted && (
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => {
              const answered = selectedAnswers[index] !== undefined;
              const active = index === currentQuestionIndex;
              const style = active
                ? "bg-[#6757ff] text-white border-[#6757ff]"
                : answered
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200";

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={`h-8 w-8 rounded-lg border text-xs font-black transition ${style}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-purple-50 bg-[#fffcf8] space-y-3">
            <h4 className="text-sm font-extrabold text-[#15132b] leading-relaxed">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h4>
            <div className="grid gap-2">
              {currentQuestion.options.map((option, optionIndex) =>
                renderOption(currentQuestion, currentQuestionIndex, option, optionIndex)
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl border border-purple-100 text-xs font-black text-[#6757ff] disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {currentQuestionIndex < totalQuestions - 1 && (
                <button
                  type="button"
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  className="px-4 py-2 rounded-xl border border-purple-100 text-xs font-black text-[#6757ff]"
                >
                  Next
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#6757ff] text-white text-xs font-black shadow-sm shadow-purple-200 disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {showSubmitConfirm && (
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 space-y-3">
              <p className="text-sm font-bold text-amber-900">
                You have unanswered questions. Do you still want to submit?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-xs font-black text-amber-900"
                >
                  Continue Quiz
                </button>
                <button
                  type="button"
                  onClick={submitQuiz}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          )}
        </div>
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
