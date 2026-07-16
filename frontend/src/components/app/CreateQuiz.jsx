import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import pdfToText from "react-pdftotext";
import QuizReview from "./QuizReview";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/api\/?$/, "");

const SOURCE_OPTIONS = [
  { value: "topic", label: "Enter a topic" },
  { value: "pdf", label: "Upload PDF/document" },
  { value: "notes", label: "Use previous generated notes/history" }
];

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"];
const OPTION_LETTERS = ["A", "B", "C", "D"];

function createMessage(role, content, extra = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    ...extra
  };
}

function normalizeApiQuiz(result) {
  const questions = Array.isArray(result.questions) ? result.questions : [];

  return {
    quizId: result.quizId || "",
    questions: questions.map((item, index) => ({
      id: `${result.quizId || "quiz"}-${index}`,
      question: item.question || `Question ${index + 1}`,
      options: Array.isArray(item.options) ? item.options.slice(0, 4) : [],
      correctAnswer: item.correctAnswer || "A",
      explanation: item.explanation || { correct: "", wrong: {} }
    }))
  };
}

function normalizeSavedQuiz(savedQuiz) {
  return {
    quizId: savedQuiz._id,
    questions: savedQuiz.questions.map((question, index) => {
      const correctIndex = question.options.findIndex((option) => option.isCorrect);
      const correctLetter = OPTION_LETTERS[correctIndex >= 0 ? correctIndex : 0];

      return {
        id: `${savedQuiz._id}-${index}`,
        question: question.question || question.questionText,
        options: question.options.map((option) => option.text),
        correctAnswer: question.correctAnswer || correctLetter,
        explanation: question.explanation || {
          correct: question.options[correctIndex]?.explanation || "This is the correct answer.",
          wrong: {
            A: question.options[0]?.explanation || "",
            B: question.options[1]?.explanation || "",
            C: question.options[2]?.explanation || "",
            D: question.options[3]?.explanation || ""
          }
        }
      };
    })
  };
}

function getWeakAreas(questions, answers, topic) {
  const missed = questions.filter((_, index) => answers[index]?.correct === false);

  if (!missed.length) return ["No major weak areas detected"];

  const candidates = missed
    .map((question) => {
      const words = question.question
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 3);
      return words.join(" ");
    })
    .filter(Boolean);

  return [...new Set(candidates)].slice(0, 4).concat(candidates.length ? [] : [topic]);
}

export default function CreateQuiz() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    createMessage("assistant", "How would you like to create your quiz?", {
      options: SOURCE_OPTIONS
    })
  ]);
  const [step, setStep] = useState("chooseSource");
  const [sourceType, setSourceType] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [historyItems, setHistoryItems] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, quiz, currentQuestionIndex, answers]);

  function appendMessage(message) {
    setMessages((previous) => [...previous, message]);
  }

  function askQuestionCount() {
    setStep("chooseCount");
    appendMessage(
      createMessage("assistant", "How many questions would you like?", {
        options: QUESTION_COUNT_OPTIONS.map((count) => ({
          value: String(count),
          label: String(count)
        }))
      })
    );
  }

  function askDifficulty() {
    setStep("chooseDifficulty");
    appendMessage(
      createMessage("assistant", "Choose a difficulty.", {
        options: DIFFICULTY_OPTIONS.map((item) => ({
          value: item.toLowerCase(),
          label: item
        }))
      })
    );
  }

  async function loadHistoryNotes() {
    setStep("loadingHistory");
    setErrorMessage("");
    appendMessage(createMessage("assistant", "Opening your saved study history..."));

    try {
      const response = await fetch(`${API_BASE_URL}/api/history?type=notes`);
      if (!response.ok) throw new Error("Could not load history.");
      const result = await response.json();
      const noteItems = (result.items || []).filter((item) => item.type === "note").slice(0, 8);

      setHistoryItems(noteItems);
      setStep("chooseHistory");
      appendMessage(
        createMessage(
          "assistant",
          noteItems.length
            ? "Choose a saved note to create your quiz from."
            : "I could not find saved notes in history. You can enter a topic or upload content instead.",
          {
            options: noteItems.map((item) => ({
              value: item.id,
              label: item.title
            }))
          }
        )
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Could not load history.");
      setStep("chooseSource");
    }
  }

  async function loadSavedNote(noteId) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`);
    if (!response.ok) throw new Error("Saved note could not be loaded.");
    const result = await response.json();
    return result.note;
  }

  const loadSavedQuiz = useCallback(async (savedQuizId) => {
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${savedQuizId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("This quiz no longer exists.");
        
        let errorMessage = "Saved quiz could not be loaded.";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch (e) {
          // ignore
        }
        throw new Error(errorMessage);
      }
      const result = await response.json();
      const savedQuiz = result.quiz;

      setTopic(savedQuiz.topic || "Saved Quiz");
      setSourceType(savedQuiz.sourceType || "notes");
      setDifficulty(savedQuiz.difficulty || "medium");
      setQuestionCount(savedQuiz.questions?.length || 5);
      setQuiz(normalizeSavedQuiz(savedQuiz));
      setCurrentQuestionIndex(0);
      setAnswers({});
      setStep("quiz");
      setMessages([
        createMessage("assistant", `Loaded saved quiz: ${savedQuiz.topic || "Saved Quiz"}`)
      ]);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Could not load saved quiz.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    const savedQuizId = searchParams.get("savedQuizId");
    if (savedQuizId) {
      const timeoutId = window.setTimeout(() => {
        loadSavedQuiz(savedQuizId);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams, loadSavedQuiz]);

  async function handleSourceSelect(value) {
    setSourceType(value);
    appendMessage(createMessage("user", SOURCE_OPTIONS.find((item) => item.value === value)?.label || value));

    if (value === "topic") {
      setStep("waitingForTopic");
      appendMessage(createMessage("assistant", "What topic should the quiz cover?"));
    } else if (value === "pdf") {
      setStep("waitingForUpload");
      appendMessage(createMessage("assistant", "Upload a PDF, text, or Markdown document for the quiz."));
    } else if (value === "notes") {
      await loadHistoryNotes();
    }
  }

  async function handleHistorySelect(noteId) {
    const item = historyItems.find((historyItem) => historyItem.id === noteId);
    appendMessage(createMessage("user", item?.title || "Saved note"));
    setErrorMessage("");

    try {
      const note = await loadSavedNote(noteId);
      const noteContent = note.body || note.summary || note.sourceText || "";
      setTopic(note.title || "Saved Notes Quiz");
      setContent(noteContent);
      setSourceType("notes");
      askQuestionCount();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Could not load that saved note.");
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    appendMessage(createMessage("user", `Uploaded ${file.name}`));

    try {
      let text = "";
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith(".pdf")) {
        text = await pdfToText(file);
        if (!text || !text.trim()) {
          throw new Error("This PDF appears scanned or image-based. OCR/text extraction is required before quiz generation.");
        }
      } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
        text = await file.text();
      } else {
        throw new Error("Please upload a PDF, TXT, or Markdown document.");
      }

      setTopic(file.name.replace(/\.[^.]+$/, ""));
      setContent(text);
      setSourceType(lowerName.endsWith(".pdf") ? "pdf" : "notes");
      askQuestionCount();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Could not read the uploaded document.");
      appendMessage(createMessage("assistant", error.message || "Could not read that document."));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleTextSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("message") || "").trim();
    event.currentTarget.reset();

    if (!value) return;

    if (step === "waitingForTopic") {
      appendMessage(createMessage("user", value));
      setTopic(value);
      setContent(value);
      askQuestionCount();
    }
  }

  async function handleOptionSelect(value) {
    if (step === "chooseSource") {
      await handleSourceSelect(value);
      return;
    }

    if (step === "chooseHistory") {
      await handleHistorySelect(value);
      return;
    }

    if (step === "chooseCount") {
      const count = Number(value);
      setQuestionCount(count);
      appendMessage(createMessage("user", String(count)));
      askDifficulty();
      return;
    }

    if (step === "chooseDifficulty") {
      setDifficulty(value);
      appendMessage(createMessage("user", DIFFICULTY_OPTIONS.find((item) => item.toLowerCase() === value) || value));
      await generateQuiz(value);
    }
  }

  async function generateQuiz(selectedDifficulty = difficulty) {
    setIsGenerating(true);
    setErrorMessage("");
    setQuiz(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep("generating");
    appendMessage(createMessage("assistant", "Generating your quiz..."));

    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          sourceType,
          content,
          numberOfQuestions: questionCount,
          difficulty: selectedDifficulty
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Quiz generation failed.");
      }

      const normalizedQuiz = normalizeApiQuiz(result);
      if (!normalizedQuiz.questions.length) {
        throw new Error("Quiz generation returned no questions.");
      }

      setQuiz(normalizedQuiz);
      setStep("quiz");
      appendMessage(createMessage("assistant", "Quiz ready. Answer one question at a time."));
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Quiz generation failed.");
      appendMessage(createMessage("assistant", error.message || "Quiz generation failed."));
      setStep("chooseSource");
    } finally {
      setIsGenerating(false);
    }
  }

  async function checkAnswer(selectedAnswer) {
    if (!quiz || answers[currentQuestionIndex]) return;

    setIsChecking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.quizId,
          questionIndex: currentQuestionIndex,
          selectedAnswer
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Answer check failed.");

      setAnswers((previous) => ({
        ...previous,
        [currentQuestionIndex]: {
          selectedAnswer,
          correct: result.correct,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          nextQuestion: result.nextQuestion
        }
      }));
    } catch (error) {
      console.error(error);
      const question = quiz.questions[currentQuestionIndex];
      setAnswers((previous) => ({
        ...previous,
        [currentQuestionIndex]: {
          selectedAnswer,
          correct: selectedAnswer === question.correctAnswer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          nextQuestion: currentQuestionIndex < quiz.questions.length - 1
        }
      }));
    } finally {
      setIsChecking(false);
    }
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((index) => index - 1);
    }
  }

  async function saveAttempt(status) {
    if (!quiz?.quizId) return;

    try {
      const selectedAnswers = Object.entries(answers).map(([index, ans]) => ({
        questionId: quiz.questions[index].id,
        selectedOptionIndex: OPTION_LETTERS.indexOf(ans.selectedAnswer)
      }));

      await fetch(`${API_BASE_URL}/api/quiz-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.quizId,
          selectedAnswers,
          status
        })
      });
    } catch (error) {
      console.error("Could not save quiz attempt", error);
    }
  }

  async function handleQuit() {
    if (Object.keys(answers).length === 0) {
      restartQuiz();
      return;
    }
    const saveInProgress = window.confirm("Do you want to save this quiz attempt as 'In Progress'?");
    if (saveInProgress) {
      await saveAttempt("in_progress");
    }
    restartQuiz();
  }

  function goToNextQuestion() {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
    } else {
      saveFinalScore();
      saveAttempt("completed");
      setStep("completed");
    }
  }

  async function saveFinalScore() {
    if (!quiz?.quizId) return;

    try {
      await fetch(`${API_BASE_URL}/api/quizzes/${quiz.quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: correctCount,
          totalQuestions
        })
      });
    } catch (error) {
      console.error("Could not save quiz score", error);
    }
  }

  function restartQuiz() {
    setMessages([
      createMessage("assistant", "How would you like to create your quiz?", {
        options: SOURCE_OPTIONS
      })
    ]);
    setStep("chooseSource");
    setSourceType("");
    setTopic("");
    setContent("");
    setQuestionCount(10);
    setDifficulty("medium");
    setHistoryItems([]);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setErrorMessage("");
  }

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((answer) => answer.correct).length;
  const wrongCount = answeredCount - correctCount;
  const totalQuestions = quiz?.questions.length || 0;
  const accuracy = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const weakAreas = quiz ? getWeakAreas(quiz.questions, answers, topic) : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-transparent">
      <header className="mb-4 flex items-center justify-between border-b border-orange-100/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0d0] text-xl text-orange-500 shadow-md shadow-orange-100">
            Q
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#15132b]">
              Interactive AI Quiz
            </h1>
            <p className="text-xs font-semibold text-[#9a93b3]">
              Create, answer, review, and save quiz practice.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={restartQuiz}
          className="rounded-xl border border-orange-100 bg-white px-4 py-2 text-xs font-black text-[#8a83a5] shadow-sm transition hover:bg-[#fff5ec]"
        >
          Start Over
        </button>
      </header>

      <main className="mb-4 flex-1 overflow-y-auto rounded-[32px] border border-orange-100 bg-white/70 p-5 shadow-xl shadow-orange-100/40">
        <div className="mx-auto max-w-[900px] space-y-5">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm font-semibold leading-relaxed shadow-sm ${
                  isUser
                    ? "rounded-tr-sm bg-orange-500 text-white"
                    : "rounded-tl-sm border border-orange-50 bg-white text-[#15132b]"
                }`}>
                  <p className="whitespace-pre-line">{message.content}</p>
                  {message.options?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleOptionSelect(option.value)}
                          disabled={isGenerating || isChecking}
                          className="rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-xs font-black text-orange-500 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-[#fff5ec] disabled:opacity-50"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {step === "waitingForUpload" && (
            <div className="flex justify-start">
              <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,text/plain,text/markdown"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl bg-[#fff0d0] px-5 py-3 text-sm font-black text-orange-500 transition hover:-translate-y-0.5"
                >
                  Upload document
                </button>
              </div>
            </div>
          )}

          {step === "quiz" && currentQuestion && (
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm shadow-orange-50">
              <div className="mb-4 flex flex-col gap-3 border-b border-orange-50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                    Question {currentQuestionIndex + 1}/{totalQuestions}
                  </p>
                  <div className="mt-2 h-2 w-56 overflow-hidden rounded-full bg-orange-50">
                    <div
                      className="h-full rounded-full bg-orange-400 transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                  <span className="rounded-xl bg-[#fffaf3] px-3 py-2 text-[#8a83a5]">
                    {answeredCount}/{totalQuestions}
                  </span>
                  <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
                    {correctCount} correct
                  </span>
                  <span className="rounded-xl bg-red-50 px-3 py-2 text-red-600">
                    {wrongCount} wrong
                  </span>
                </div>
              </div>

              <h2 className="mb-4 text-lg font-black leading-7 text-[#15132b]">
                {currentQuestion.question}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const letter = OPTION_LETTERS[index];
                  const selected = currentAnswer?.selectedAnswer === letter;
                  const correct = currentAnswer?.correctAnswer === letter;

                  let style = "border-orange-100 bg-white text-[#15132b] hover:bg-[#fff5ec] hover:border-orange-300";
                  if (currentAnswer && correct) style = "border-emerald-200 bg-emerald-50 text-emerald-800";
                  if (currentAnswer && selected && !correct) style = "border-red-200 bg-red-50 text-red-700";
                  if (currentAnswer && !selected && !correct) style = "border-orange-50 bg-white text-[#9a93b3] opacity-70";

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => checkAnswer(letter)}
                      disabled={Boolean(currentAnswer) || isChecking}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${style}`}
                    >
                      <span className="mr-2 font-black">{letter}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {currentAnswer && (
                <div className="mt-5 rounded-3xl border border-orange-100 bg-[#fffaf3] p-5">
                  <p className={`text-sm font-black ${currentAnswer.correct ? "text-emerald-700" : "text-red-600"}`}>
                    {currentAnswer.correct ? "Correct Answer:" : "Incorrect. Correct Answer:"} {currentAnswer.correctAnswer}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[#15132b]">
                    Your answer:
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#655d80]">
                    {currentAnswer.selectedAnswer}. {currentQuestion.options[OPTION_LETTERS.indexOf(currentAnswer.selectedAnswer)]}
                  </p>

                  <div className="mt-4 space-y-3 text-sm leading-6">
                    <div>
                      <p className="font-black text-[#15132b]">Why this is correct:</p>
                      <p className="font-semibold text-[#655d80]">{currentAnswer.explanation?.correct}</p>
                    </div>

                    <div>
                      <p className="font-black text-[#15132b]">Why other answers are wrong:</p>
                      <div className="mt-2 space-y-2">
                        {OPTION_LETTERS.filter((letter) => letter !== currentAnswer.correctAnswer).map((letter) => (
                          <p key={letter} className="font-semibold text-[#655d80]">
                            <span className="font-black text-red-500">{letter}</span> {currentAnswer.explanation?.wrong?.[letter] || "This option does not match the source content."}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between">
                    {currentQuestionIndex > 0 ? (
                      <button
                        type="button"
                        onClick={goToPreviousQuestion}
                        className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleQuit}
                        className="rounded-2xl border border-red-100 bg-white px-5 py-3 text-sm font-black text-red-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50"
                      >
                        Quit
                      </button>
                      <button
                        type="button"
                        onClick={goToNextQuestion}
                        className="rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5"
                      >
                        {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === "completed" && quiz && quiz.questions && (
            <QuizReview
              quiz={quiz}
              answers={answers}
              score={correctCount}
              totalQuestions={totalQuestions}
              onRetry={() => {
                setAnswers({});
                setCurrentQuestionIndex(0);
                setStep("quiz");
              }}
            />
          )}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="rounded-3xl border border-orange-50 bg-white px-5 py-3.5 text-sm font-black text-orange-500 shadow-sm">
                Generating quiz...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {errorMessage && (
        <p className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {errorMessage}
        </p>
      )}

      <footer className="mx-auto w-full max-w-[920px]">
        <form onSubmit={handleTextSubmit} className="relative flex items-end gap-2 rounded-[28px] border border-orange-100 bg-[#f3eee8] p-2 focus-within:border-orange-400 focus-within:bg-white">
          <textarea
            name="message"
            disabled={step !== "waitingForTopic" || isGenerating}
            placeholder={step === "waitingForTopic" ? "Enter a quiz topic..." : "Use the choices above to continue..."}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm font-semibold leading-relaxed text-[#15132b] outline-none placeholder:text-[#b7adc4] disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={step !== "waitingForTopic" || isGenerating}
            className="h-11 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-5 text-sm font-black text-white shadow-md shadow-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
