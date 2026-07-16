import React, { useState } from 'react';

const OPTION_LETTERS = ["A", "B", "C", "D"];

function inferAreas(quizQuestions, answers) {
  const strong = [];
  const weak = [];

  if (!quizQuestions || !answers) return { strong: [], weak: [] };

  quizQuestions.forEach((question, index) => {
    const answer = answers[index];
    if (!answer) return;
    
    // Determine if correct based on answer object or recalculate
    const selectedLetter = answer.selectedAnswer || answer.userAnswer || (answer.selectedOptionIndex !== undefined && answer.selectedOptionIndex !== null ? OPTION_LETTERS[answer.selectedOptionIndex] : null);
    const correctLetter = question.correctAnswer || (answer.correctOptionIndex !== undefined ? OPTION_LETTERS[answer.correctOptionIndex] : null);
    
    const isCorrect = answer.isCorrect !== undefined ? answer.isCorrect : (selectedLetter === correctLetter);
    
    const target = isCorrect ? strong : weak;
    const qText = question.questionText || question.question || "";
    const words = qText
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

export default function QuizReview({ quiz, answers, score, totalQuestions, attemptId, isSaved, onSave, onUnsave, onRetry, onClose }) {
  const accuracy = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  
  const [openedExplanations, setOpenedExplanations] = useState({});

  function toggleExplanation(index) {
    setOpenedExplanations((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  }

  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
    return (
      <div className="flex flex-col gap-6 p-6 text-center">
        <p className="text-lg font-bold text-gray-400">Loading review data...</p>
      </div>
    );
  }

  const areas = inferAreas(quiz.questions, answers);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-purple-100 bg-white p-6 text-center shadow-sm">
        <h2 className="text-2xl font-black text-[#6757ff]">Quiz Review</h2>
        <p className="mt-4 text-lg font-black text-[#15132b]">
          Score: {score}/{totalQuestions}
        </p>
        <p className="mt-2 text-lg font-black text-orange-500">
          Accuracy: {accuracy}%
        </p>
        
        {/* Render strong/weak areas if we have them */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
            <p className="text-xs font-black uppercase text-emerald-700 mb-2">Strong Areas</p>
            <ul className="space-y-1 text-xs font-semibold text-[#15132b]">
              {(areas.strong.length ? areas.strong : ["Keep practicing"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100">
            <p className="text-xs font-black uppercase text-red-700 mb-2">Weak Areas</p>
            <ul className="space-y-1 text-xs font-semibold text-[#15132b]">
              {(areas.weak.length ? areas.weak : ["No major weak areas"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 border border-purple-100">
            <p className="text-xs font-black uppercase text-[#6757ff] mb-2">Recommended</p>
            <ul className="space-y-1 text-xs font-semibold text-[#15132b]">
              <li>Review weak areas</li>
              <li>Retry incorrect questions</li>
              <li>Ask a follow-up question</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 border-t border-purple-50 pt-6">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-2xl border border-orange-100 bg-white px-5 py-2.5 text-sm font-black text-orange-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fff5ec]"
            >
              Retry Quiz
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              Close
            </button>
          )}

          <div className="w-px h-10 bg-gray-200 mx-2 hidden sm:block"></div>
          
          {isSaved === false && onSave && (
            <button
              onClick={onSave}
              className="rounded-2xl bg-[#6757ff] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              ⭐ Save this attempt
            </button>
          )}
          
          {isSaved === true && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-100 pl-4 pr-1.5 py-1.5 shadow-inner">
              <span className="text-sm font-black text-emerald-600">Saved ✓</span>
              {onUnsave && (
                <button
                  onClick={() => {
                    if (window.confirm("Delete this attempt from your history?")) {
                      onUnsave();
                    }
                  }}
                  className="rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-black text-red-500 shadow-sm transition hover:bg-red-50"
                >
                  Unsave
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        {quiz.questions.map((question, index) => {
          const answer = answers[index];
          if (!answer) return null;

          const selectedLetter = answer.selectedAnswer || answer.userAnswer || (answer.selectedOptionIndex !== undefined && answer.selectedOptionIndex !== null ? OPTION_LETTERS[answer.selectedOptionIndex] : null);
          const correctLetter = question.correctAnswer || (answer.correctOptionIndex !== undefined ? OPTION_LETTERS[answer.correctOptionIndex] : null);
          const isCorrect = answer.isCorrect !== undefined ? answer.isCorrect : (selectedLetter === correctLetter);

          return (
            <div key={index} className="rounded-2xl border border-purple-50 bg-[#fffcf8] p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-extrabold text-[#15132b] leading-relaxed">
                  {index + 1}. {question.questionText || question.question}
                </h4>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                    isCorrect
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>

              <div className="grid gap-2 mt-3">
                {(() => {
                  let optionsToRender = question.options;
                  if (!optionsToRender || !Array.isArray(optionsToRender) || optionsToRender.length === 0) {
                    optionsToRender = ["Option A", "Option B", "Option C", "Option D"];
                  }
                  return optionsToRender.map((option, optIndex) => {
                    const letter = OPTION_LETTERS[optIndex];
                    const isUserAnswer = selectedLetter === letter;
                    const isCorrectAnswer = correctLetter === letter;

                    let style = "bg-white border-purple-100 text-[#15132b]";
                    if (isCorrectAnswer) {
                      style = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      style = "bg-red-50 border-red-200 text-red-700 font-bold";
                    } else {
                      style = "bg-white border-purple-50 text-gray-500";
                    }

                    const optionText = typeof option === 'string' ? option : option.text;

                    return (
                      <div
                        key={letter}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold border ${style}`}
                      >
                        <span className="font-black mr-2">{letter}.</span>
                        {optionText}
                      </div>
                    );
                  });
                })()}
              </div>

              {!isCorrect && correctLetter && (
                <p className="text-[11px] font-bold text-red-700 mt-2">
                  Correct answer: {correctLetter}
                </p>
              )}

              <div className="mt-4 pt-2 border-t border-purple-50">
                <button
                  type="button"
                  onClick={() => toggleExplanation(index)}
                  className="px-3 py-2 rounded-xl border border-purple-100 text-[11px] font-black text-[#6757ff] bg-white transition hover:bg-purple-50"
                >
                  {openedExplanations[index] ? "Hide Explanation" : "Explain Answer"}
                </button>

                {openedExplanations[index] && (
                  <div className="mt-3 p-3 rounded-xl border border-purple-100 bg-white text-[11px] leading-relaxed font-semibold text-[#15132b] space-y-2">
                    <p>
                      <span className="font-black text-emerald-700">Correct Answer:</span>{" "}
                      {typeof question.explanation === 'object' 
                        ? question.explanation.correct 
                        : (question.explanation || (question.options?.find?.(o => o.isCorrect)?.explanation) || answer.correctOptionExplanation || "This is the correct answer.")}
                    </p>
                    {selectedLetter && selectedLetter !== correctLetter && (
                      <p>
                        <span className="font-black text-red-700">Your Answer ({selectedLetter}):</span>{" "}
                        {typeof question.explanation === 'object' && question.explanation.wrong
                          ? question.explanation.wrong[selectedLetter]
                          : (answer.selectedOptionExplanation || "This option is incorrect.")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
