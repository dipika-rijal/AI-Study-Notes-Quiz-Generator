import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import pdfToText from "react-pdftotext";
import QuizReview from "./QuizReview";
import api from "../../api/axios";

const SOURCE_OPTIONS = [
  { value: "file", label: "Upload Files" }
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
      id: item.id || `${result.quizId || "quiz"}-${index}`,
      sourceId: item.id ? String(item.id) : undefined,
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
        sourceId: String(question._id),
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
  const navigate = useNavigate();
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
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
      const response = await api.get("/history?type=notes");
      const result = response.data;
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
    const response = await api.get(`/notes/${noteId}`);
    return response.data.note;
  }

  const loadSavedQuiz = useCallback(async (savedQuizId, resumeAttemptId = null) => {
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await api.get(`/quizzes/${savedQuizId}`);
      const savedQuiz = response.data.quiz;

      setTopic(savedQuiz.topic || "Saved Quiz");
      setSourceType(savedQuiz.sourceType || "notes");
      setDifficulty(savedQuiz.difficulty || "medium");
      setQuestionCount(savedQuiz.questions?.length || 5);
      const normalizedQuiz = normalizeSavedQuiz(savedQuiz);
      let restoredAnswers = {};

      if (resumeAttemptId) {
        const attemptResponse = await api.get(`/quiz-attempts/${resumeAttemptId}`);
        const attempt = attemptResponse.data.attempt;
        const selections = new Map((attempt.selectedAnswers || []).map((answer) => [String(answer.questionId), answer.selectedOptionIndex]));
        const feedback = new Map((attempt.feedback || []).map((item) => [String(item.questionId), item]));

        normalizedQuiz.questions.forEach((question, index) => {
          const selectedOptionIndex = selections.get(question.sourceId);
          if (selectedOptionIndex === undefined) return;
          const item = feedback.get(question.sourceId);
          restoredAnswers[index] = {
            selectedAnswer: OPTION_LETTERS[selectedOptionIndex],
            correctAnswer: OPTION_LETTERS[item?.correctOptionIndex ?? OPTION_LETTERS.indexOf(question.correctAnswer)],
            correct: item?.isCorrect ?? selectedOptionIndex === OPTION_LETTERS.indexOf(question.correctAnswer),
            explanation: question.explanation
          };
        });
      }

      setQuiz(normalizedQuiz);
      setAnswers(restoredAnswers);
      setCurrentQuestionIndex(Math.min(Object.keys(restoredAnswers).length, Math.max(normalizedQuiz.questions.length - 1, 0)));
      setStep("quiz");
      setMessages([
        createMessage("assistant", resumeAttemptId ? `Resumed quiz: ${savedQuiz.topic || "Saved Quiz"}` : `Loaded saved quiz: ${savedQuiz.topic || "Saved Quiz"}`)
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
      const resumeAttemptId = searchParams.get("resumeAttemptId");
      const timeoutId = window.setTimeout(() => {
        loadSavedQuiz(savedQuizId, resumeAttemptId);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams, loadSavedQuiz]);

  async function handleSourceSelect(value) {
    setSourceType(value);
    appendMessage(createMessage("user", SOURCE_OPTIONS.find((item) => item.value === value)?.label || value));

    if (value === "file") {
      setStep("waitingForUpload");
      appendMessage(createMessage("assistant", "Upload a document for the quiz."));
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

    if (file.type.startsWith("image/")) {
      setErrorMessage("Please use the Upload Image option for images.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      let text = "";
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith(".pdf")) {
        text = await pdfToText(file);
        if (!text || !text.trim()) {
          throw new Error("This PDF appears scanned or image-based. OCR/text extraction is required before quiz generation.");
        }
      } else {
        text = await file.text();
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
      const response = await api.post("/quizzes/generate", {
        topic,
        sourceType,
        content,
        numberOfQuestions: questionCount,
        difficulty: selectedDifficulty
      });

      const result = response.data;

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
      const response = await api.post("/quizzes/check-answer", {
        quizId: quiz.quizId,
        questionIndex: currentQuestionIndex,
        selectedAnswer
      });

      const result = response.data;

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
        questionId: quiz.questions[index].sourceId || quiz.questions[index].id,
        selectedOptionIndex: OPTION_LETTERS.indexOf(ans.selectedAnswer)
      }));

      await api.post("/quiz-attempts", {
        quizId: quiz.quizId,
        selectedAnswers,
        status
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
    setShowQuitModal(true);
  }

  async function confirmQuit(shouldSave) {
    if (shouldSave) {
      await saveAttempt("in_progress");
    }
    setShowQuitModal(false);
    navigate("/app/history");
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

    const missedConcepts = Object.values(answers)
      .filter((a) => !a.correct && a.explanation?.core_concept)
      .map((a) => a.explanation.core_concept);

    try {
      await api.put(`/quizzes/${quiz.quizId}`, {
        score: correctCount,
        totalQuestions,
        missedConcepts
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
    <div className="mx-auto flex h-[calc(100vh-6.25rem)] lg:h-[calc(100vh-4rem)] w-full max-w-6xl flex-col bg-transparent">
      <header className="mb-4 flex items-center justify-between border-b border-[var(--theme-glass-border)] pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-primary-500)] text-xl text-white shadow-md">
            Q
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[var(--theme-text-primary)]">
              Quiz Assistant
            </h1>
            <p className="text-xs font-semibold text-[var(--theme-text-secondary)]">
              Create focused practice from a topic, file, or saved notes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={restartQuiz}
          className="rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-4 py-2 text-xs font-black text-[var(--theme-text-secondary)] shadow-sm transition hover:bg-[var(--theme-bg-tertiary)]"
        >
          Start Over
        </button>
      </header>

      <main className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-4 shadow-sm md:p-6">
        <div className="mx-auto max-w-[900px] space-y-5">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm font-semibold leading-relaxed shadow-sm dark:shadow-none ${
                  isUser
                    ? "rounded-tr-sm bg-[var(--color-primary-500)] text-white"
                    : "rounded-tl-sm border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)]"
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
                          className="rounded-full border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-4 py-2.5 text-xs font-semibold text-[var(--color-primary-500)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary-500)] hover:bg-[var(--theme-bg-tertiary)] disabled:opacity-50"
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
              <div className="rounded-3xl border border-orange-100 dark:border-[#424242] bg-white dark:bg-[#2f2f2f] p-4 shadow-sm dark:shadow-none">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl bg-[#fff0d0] dark:bg-[#171717] dark:border dark:border-[#424242] px-5 py-3 text-sm font-black text-orange-500 dark:text-[#10a37f] transition hover:-translate-y-0.5"
                >
                  Upload document
                </button>
              </div>
            </div>
          )}

          {(step === "quiz" || step === "completed") && currentQuestion && (
            <section className="rounded-3xl border border-orange-100 dark:border-[#424242] bg-white dark:bg-[#2f2f2f] p-5 shadow-sm shadow-orange-50 dark:shadow-none">
              <div className="mb-4 flex flex-col gap-3 border-b border-orange-50 dark:border-[#424242] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-500 dark:text-[#10a37f]">
                    Question {currentQuestionIndex + 1}/{totalQuestions}
                  </p>
                  <div className="mt-2 h-2 w-56 overflow-hidden rounded-full bg-orange-50 dark:bg-[#171717]">
                    <div
                      className="h-full rounded-full bg-orange-400 transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                  <span className="rounded-xl bg-[#fffaf3] dark:bg-[#171717] px-3 py-2 text-[#8a83a5] dark:text-[#b4b4b4]">
                    {answeredCount}/{totalQuestions}
                  </span>
                  <span className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-emerald-700 dark:text-emerald-400">
                    {correctCount} correct
                  </span>
                  <span className="rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-red-600 dark:text-red-400">
                    {wrongCount} wrong
                  </span>
                </div>
              </div>

              <h2 className="mb-4 text-lg font-black leading-7 text-[#15132b] dark:text-[#ececec]">
                {currentQuestion.question}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const letter = OPTION_LETTERS[index];
                  const selected = currentAnswer?.selectedAnswer === letter;
                  const correct = currentAnswer?.correctAnswer === letter;

                  let style = "border-orange-100 dark:border-[#424242] bg-white dark:bg-[#171717] text-[#15132b] dark:text-[#ececec] hover:bg-[#fff5ec] dark:hover:bg-[#2f2f2f] hover:border-orange-300 dark:hover:border-[#10a37f]";
                  if (currentAnswer && correct) style = "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400";
                  if (currentAnswer && selected && !correct) style = "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                  if (currentAnswer && !selected && !correct) style = "border-orange-50 dark:border-[#424242] bg-white dark:bg-[#171717] text-[#9a93b3] dark:text-[#999999] opacity-70";

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
                <div className="mt-5 rounded-3xl border border-orange-100 dark:border-[#424242] bg-[#fffaf3] dark:bg-[#171717] p-5">
                  <p className={`text-sm font-black ${currentAnswer.correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {currentAnswer.correct ? "Correct Answer:" : "Incorrect. Correct Answer:"} {currentAnswer.correctAnswer}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[#15132b] dark:text-[#ececec]">
                    Your answer:
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#655d80] dark:text-[#b4b4b4]">
                    {currentAnswer.selectedAnswer}. {currentQuestion.options[OPTION_LETTERS.indexOf(currentAnswer.selectedAnswer)]}
                  </p>

                  <div className="mt-4 space-y-3 text-sm leading-6">
                    {currentAnswer.explanation?.core_concept && (
                      <div className="mb-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-100 dark:border-purple-800/50">
                        <p className="font-black text-purple-900 dark:text-purple-300">🧠 Core Concept:</p>
                        <p className="font-semibold text-purple-800 dark:text-purple-400">{currentAnswer.explanation.core_concept}</p>
                      </div>
                    )}

                    <div>
                      <p className="font-black text-[#15132b] dark:text-[#ececec]">Why this is correct:</p>
                      <p className="font-semibold text-[#655d80] dark:text-[#b4b4b4]">{currentAnswer.explanation?.correct}</p>
                    </div>

                    <div>
                      <p className="font-black text-[#15132b] dark:text-[#ececec]">Why other answers are wrong:</p>
                      <div className="mt-2 space-y-2">
                        {OPTION_LETTERS.filter((letter) => letter !== currentAnswer.correctAnswer).map((letter) => (
                          <p key={letter} className="font-semibold text-[#655d80] dark:text-[#b4b4b4]">
                            <span className="font-black text-red-500 dark:text-red-400">{letter}</span> {currentAnswer.explanation?.wrong?.[letter] || "This option does not match the source content."}
                          </p>
                        ))}
                      </div>
                    </div>

                    {currentAnswer.explanation?.memory_trick && (
                      <div className="mt-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-100 dark:border-yellow-800/50">
                        <p className="font-black text-yellow-900 dark:text-yellow-300">💡 Memory Trick:</p>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-400">{currentAnswer.explanation.memory_trick}</p>
                      </div>
                    )}
                  </div>

                  {step === "quiz" && (
                    <div className="mt-5 flex justify-between">
                    {currentQuestionIndex > 0 ? (
                      <button
                        type="button"
                        onClick={goToPreviousQuestion}
                        className="rounded-2xl border border-gray-200 dark:border-[#424242] bg-white dark:bg-[#171717] px-3 py-2.5 sm:px-5 sm:py-3 text-sm font-black text-gray-600 dark:text-[#b4b4b4] shadow-sm dark:shadow-none transition hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-[#2f2f2f]"
                      >
                        Previous
                      </button>
                    ) : <div></div>}
                    <div className="flex gap-1.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleQuit}
                        className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-white dark:bg-[#171717] px-3 py-2.5 sm:px-5 sm:py-3 text-sm font-black text-red-500 dark:text-red-400 shadow-sm dark:shadow-none transition hover:-translate-y-0.5 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Quit
                      </button>
                      <button
                        type="button"
                        onClick={goToNextQuestion}
                        className="rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 dark:from-[#10a37f] dark:to-[#05503e] px-3 py-2.5 sm:px-5 sm:py-3 text-sm font-black text-white shadow-lg shadow-orange-100 dark:shadow-none transition hover:-translate-y-0.5 whitespace-nowrap"
                      >
                        {currentQuestionIndex < totalQuestions - 1 ? <><span className="sm:hidden">Next</span><span className="hidden sm:inline">Next Question</span></> : <><span className="sm:hidden">Finish</span><span className="hidden sm:inline">Finish Quiz</span></>}
                      </button>
                    </div>
                    </div>
                  )}
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
              <div className="rounded-3xl border border-orange-50 dark:border-[#10a37f]/50 bg-white dark:bg-[#171717] px-5 py-3.5 text-sm font-black text-orange-500 dark:text-[#10a37f] shadow-sm dark:shadow-none">
                Generating quiz...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {errorMessage && (
        <p className="mb-4 rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <footer className="mx-auto w-full max-w-[920px]">
        <form onSubmit={handleTextSubmit} className="relative flex items-end gap-2 rounded-[28px] border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-2 focus-within:border-[var(--color-primary-500)] focus-within:ring-2 focus-within:ring-[var(--color-primary-500)]/10 transition shadow-sm">
          <textarea
            name="message"
            disabled={step !== "waitingForTopic" || isGenerating}
            placeholder={step === "waitingForTopic" ? "Enter a quiz topic..." : "Use the choices above to continue..."}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm font-semibold leading-relaxed text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-muted)] disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={step !== "waitingForTopic" || isGenerating}
            className="h-11 rounded-2xl bg-[var(--color-primary-500)] px-5 text-sm font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-110 transition"
          >
            Send
          </button>
        </form>
      </footer>

      {showQuitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15132b]/60 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-xl dark:border-[#424242] dark:bg-[#171717]">
            <h3 className="mb-2 text-xl font-black tracking-tight text-[#15132b] dark:text-[#ececec]">Quit Quiz?</h3>
            <p className="mb-6 text-sm font-semibold text-[#655d80] dark:text-[#b4b4b4]">
              Do you want to save this quiz attempt as 'In Progress'?
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => confirmQuit(true)}
                className="rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-3 text-sm font-black text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 dark:from-[#10a37f] dark:to-[#05503e] dark:shadow-none"
              >
                Save & Quit
              </button>
              <button
                type="button"
                onClick={() => confirmQuit(false)}
                className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:shadow-none"
              >
                Quit without saving
              </button>
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 dark:border-[#424242] dark:bg-[#2f2f2f] dark:text-[#b4b4b4] dark:hover:bg-[#424242] dark:shadow-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
