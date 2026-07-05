import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { generateQuizWithAI } from "../../services/ai";

export default function CreateQuiz() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [inputType, setInputType] = useState("topic");
  const [questionCount, setQuestionCount] = useState(5);
  const [input, setInput] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("empty");
  const [savedQuizId, setSavedQuizId] = useState(null);

  const tabs = [
    {
      id: "topic",
      label: "Topic",
      icon: "⌕",
      placeholder: "e.g. Logistic Regression, React useState, Machine Learning...",
    },
    {
      id: "content",
      label: "Upload / Paste",
      icon: "▤",
      placeholder: "Paste your notes here or upload a .txt / .md file...",
    },
  ];

  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    const savedQuizIdFromUrl = searchParams.get("savedQuizId");

    if (savedQuizIdFromUrl) {
      return;
    }

    if (typeFromUrl === "content") {
      setInputType("content");
      return;
    }

    setInputType("topic");
  }, [searchParams]);

  useEffect(() => {
    const savedQuizIdFromUrl = searchParams.get("savedQuizId");

    if (savedQuizIdFromUrl) {
      loadSavedQuiz(savedQuizIdFromUrl);
    }
  }, [searchParams]);

  const currentTab = tabs.find((tab) => tab.id === inputType);

  function updateQuestionCount(value) {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      setQuestionCount(1);
      return;
    }

    if (numberValue < 1) {
      setQuestionCount(1);
      return;
    }

    if (numberValue > 20) {
      setQuestionCount(20);
      return;
    }

    setQuestionCount(numberValue);
  }

  function createFallbackExplanation(question, answer) {
    return `This is correct because "${answer}" best matches what the question is asking about.`;
  }

  function normalizeQuiz(rawQuiz) {
    return rawQuiz.map((item, index) => {
      const options = Array.isArray(item.options) ? item.options : [];
      const answer =
        item.answer ||
        item.correctAnswer ||
        item.correct_answer ||
        options[0] ||
        "";

      return {
        id: `${Date.now()}-${index}`,
        question: item.question || `Question ${index + 1}`,
        options,
        answer,
        explanation:
          item.explanation ||
          item.reason ||
          item.reasoning ||
          createFallbackExplanation(item.question, answer),
      };
    });
  }

  function getFourOptions(item) {
    let options = Array.isArray(item.options) ? item.options.filter(Boolean) : [];

    if (item.answer && !options.includes(item.answer)) {
      options = [item.answer, ...options];
    }

    options = [...new Set(options)].slice(0, 4);

    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }

    return options;
  }

  function buildQuizPayload() {
    return {
      topic: input.trim().slice(0, 60) || "Untitled Quiz",
      content: input.trim(),
      difficulty: "medium",
      sourceType: "ai-generated",
      questions: generatedQuiz.map((item) => {
        const options = getFourOptions(item);

        return {
          questionText: item.question,
          options: options.map((option) => ({
            text: option,
            isCorrect: option === item.answer,
            explanation:
              item.explanation ||
              `This is correct because "${item.answer}" best matches the question.`,
          })),
        };
      }),
    };
  }

  async function handleSaveQuiz() {
    if (!generatedQuiz || generatedQuiz.length === 0) {
      setErrorMessage("Generate a quiz first before saving.");
      return;
    }

    try {
      setSaveStatus("saving");
      setErrorMessage("");

      const response = await fetch("http://localhost:5000/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildQuizPayload()),
      });

      if (!response.ok) {
        throw new Error("Quiz could not be saved.");
      }

      const result = await response.json();

      setSavedQuizId(result.quiz?._id || null);
      setSaveStatus("saved");
    } catch (error) {
      console.error(error);
      setSaveStatus("unsaved");
      setErrorMessage("Quiz was not saved. Make sure backend is running.");
    }
  }

  function convertSavedQuizToFrontend(savedQuiz) {
    return savedQuiz.questions.map((question, index) => {
      const correctOption = question.options.find((option) => option.isCorrect);

      return {
        id: `${savedQuiz._id}-${index}`,
        question: question.questionText,
        options: question.options.map((option) => option.text),
        answer: correctOption?.text || "",
        explanation:
          correctOption?.explanation ||
          "This is the correct answer based on the saved quiz.",
      };
    });
  }

  async function loadSavedQuiz(savedQuizIdFromUrl) {
    try {
      setIsGenerating(true);
      setErrorMessage("");

      const response = await fetch(
        `http://localhost:5000/api/quizzes/${savedQuizIdFromUrl}`
      );

      if (!response.ok) {
        throw new Error("Saved quiz could not be loaded.");
      }

      const result = await response.json();
      const savedQuiz = result.quiz;

      const convertedQuiz = convertSavedQuizToFrontend(savedQuiz);

      setInput(savedQuiz.topic || "");
      setInputType("topic");
      setQuestionCount(convertedQuiz.length || 5);
      setGeneratedQuiz(convertedQuiz);
      setSelectedAnswers({});
      setSaveStatus("saved");
      setSavedQuizId(savedQuiz._id);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not open saved quiz from history.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["text/plain", "text/markdown"];
    const allowedExtensions = [".txt", ".md"];
    const fileName = file.name.toLowerCase();

    const hasAllowedType = allowedTypes.includes(file.type);
    const hasAllowedExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasAllowedType && !hasAllowedExtension) {
      setErrorMessage("Please upload only .txt or .md files for now.");
      return;
    }

    if (file.size > 700000) {
      setErrorMessage("File is too large. Please upload a file under 700KB.");
      return;
    }

    try {
      const text = await file.text();

      setInputType("content");
      setInput(text);
      setUploadedFileName(file.name);
      setErrorMessage("");
      setSaveStatus("empty");
      setSavedQuizId(null);
    } catch (error) {
      setErrorMessage("Could not read the uploaded file. Try another file.");
    }
  }

  async function handleGenerateQuiz() {
    if (!input.trim()) {
      setErrorMessage("Please enter a topic, paste content, or upload a file first.");
      return;
    }

    if (questionCount < 1 || questionCount > 20) {
      setErrorMessage("Please choose between 1 and 20 questions.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setGeneratedQuiz(null);
    setSelectedAnswers({});
    setSaveStatus("empty");
    setSavedQuizId(null);

    try {
      const quiz = await generateQuizWithAI(
        input,
        currentTab.label,
        questionCount
      );

      if (!Array.isArray(quiz) || quiz.length === 0) {
        throw new Error("AI did not return valid quiz questions.");
      }

      const cleanQuiz = normalizeQuiz(quiz);

      setGeneratedQuiz(cleanQuiz);
      setSaveStatus("unsaved");
      setSavedQuizId(null);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.message ||
          "AI could not generate quiz right now. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSelectAnswer(questionIndex, option) {
    setSelectedAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionIndex]: option,
    }));
  }

  function handleClear() {
    setInput("");
    setQuestionCount(5);
    setUploadedFileName("");
    setGeneratedQuiz(null);
    setSelectedAnswers({});
    setErrorMessage("");
    setSaveStatus("empty");
    setSavedQuizId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0d0] text-2xl text-orange-500 shadow-md shadow-orange-100">
          ◎
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#15132b]">
            Create Quiz
          </h1>

          <p className="mt-1 font-semibold text-[#9a93b3]">
            Generate real AI quiz questions from a topic or study content.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-orange-100 bg-white/85 p-6 shadow-xl shadow-orange-100/60">
          <h2 className="mb-5 text-lg font-black text-[#15132b]">
            What should the quiz cover?
          </h2>

          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[#f3eee8] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInputType(tab.id)}
                className={`rounded-xl px-3 py-3 text-xs font-black transition ${
                  inputType === tab.id
                    ? "bg-white text-orange-500 shadow-md"
                    : "text-[#9a93b3] hover:text-[#15132b]"
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {inputType === "content" && (
            <div className="mb-4 rounded-3xl border border-orange-100 bg-[#fffaf3] p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl bg-[#fff0d0] px-5 py-3 text-sm font-black text-orange-500 transition hover:-translate-y-0.5"
              >
                📁 Upload text file
              </button>

              <p className="mt-3 text-xs font-bold text-[#9a93b3]">
                Supported now: .txt and .md files. PDF/DOCX can be added later.
              </p>

              {uploadedFileName && (
                <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-emerald-700">
                  Uploaded: {uploadedFileName}
                </p>
              )}
            </div>
          )}

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setSaveStatus("empty");
              setSavedQuizId(null);
            }}
            placeholder={currentTab.placeholder}
            className="min-h-[170px] w-full resize-none rounded-3xl border border-transparent bg-[#f3eee8] px-5 py-4 font-semibold leading-7 text-[#15132b] outline-none transition placeholder:text-[#b7adc4] focus:border-orange-400 focus:bg-white"
          />

          <label className="mt-5 block text-sm font-black text-[#8a83a5]">
            Number of questions
          </label>

          <div className="mt-4 rounded-3xl border border-orange-100 bg-[#fffaf3] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-[#15132b]">
                  Choose quiz amount
                </p>
                <p className="mt-1 text-xs font-bold text-[#9a93b3]">
                  Minimum 1, maximum 20 questions.
                </p>
              </div>

              <input
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(event) => updateQuestionCount(event.target.value)}
                disabled={isGenerating}
                className="w-24 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-center font-black text-orange-500 outline-none focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <input
              type="range"
              min="1"
              max="20"
              value={questionCount}
              onChange={(event) => updateQuestionCount(event.target.value)}
              disabled={isGenerating}
              className="mt-4 w-full accent-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
              {errorMessage}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleGenerateQuiz}
              disabled={!input.trim() || isGenerating}
              className="flex-1 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-4 font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating
                ? `Generating ${questionCount} questions...`
                : `✨ Generate ${questionCount} Questions`}
            </button>

            <button
              onClick={handleClear}
              disabled={isGenerating}
              className="rounded-2xl border border-orange-100 bg-white px-5 py-4 font-black text-[#8a83a5] transition hover:bg-[#fff5ec] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-orange-100 bg-white/85 shadow-xl shadow-orange-100/60">
          <div className="flex items-center justify-between border-b border-orange-100 px-6 py-5">
            <h2 className="text-lg font-black text-[#15132b]">
              Generated Quiz
            </h2>

            {generatedQuiz && (
              <span className="rounded-full bg-[#fff0d0] px-4 py-2 text-xs font-black text-orange-500">
                {generatedQuiz.length} Questions
              </span>
            )}
          </div>

          <div className="min-h-[455px] p-6">
            {isGenerating ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-3xl bg-[#fff0d0] text-3xl text-orange-500">
                  ✨
                </div>

                <h3 className="font-black text-orange-500">
                  Loading quiz...
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#b0a8c2]">
                  Generating or opening your quiz.
                </p>
              </div>
            ) : !generatedQuiz ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#fff0d0] text-3xl text-orange-500">
                  ◎
                </div>

                <h3 className="font-black text-[#8a83a5]">
                  Your AI quiz will appear here
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#b0a8c2]">
                  Choose question count, enter topic/content, and generate quiz.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#15132b]">
                      Save status
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#9a93b3]">
                      {saveStatus === "unsaved" && "Not saved yet"}
                      {saveStatus === "saving" && "Saving quiz..."}
                      {saveStatus === "saved" &&
                        (savedQuizId ? "Saved to History ✅" : "Saved ✅")}
                      {saveStatus === "empty" && "Generate a quiz first"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveQuiz}
                    disabled={saveStatus === "saving" || saveStatus === "saved"}
                    className="rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saveStatus === "saved" ? "Saved ✅" : "Save Quiz"}
                  </button>
                </div>

                {generatedQuiz.map((item, index) => {
                  const selectedAnswer = selectedAnswers[index];
                  const hasSelected = Boolean(selectedAnswer);
                  const isCorrect = selectedAnswer === item.answer;

                  return (
                    <div
                      key={item.id || `${item.question}-${index}`}
                      className="rounded-3xl border border-orange-100 bg-[#fffaf3] p-5"
                    >
                      <h3 className="mb-4 font-black leading-7 text-[#15132b]">
                        {index + 1}. {item.question}
                      </h3>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {item.options.map((option) => {
                          const isSelected = selectedAnswer === option;
                          const isRightAnswer = option === item.answer;

                          let optionStyle = "bg-white text-[#77718f] hover:bg-[#fff0d0]";

                          if (hasSelected && isRightAnswer) {
                            optionStyle = "bg-[#edfff6] text-emerald-700";
                          }

                          if (hasSelected && isSelected && !isRightAnswer) {
                            optionStyle = "bg-red-50 text-red-500";
                          }

                          return (
                            <button
                              type="button"
                              key={option}
                              onClick={() => handleSelectAnswer(index, option)}
                              className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${optionStyle}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {!hasSelected ? (
                        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#9a93b3]">
                          Click one option to check your answer.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <p
                            className={`rounded-2xl px-4 py-3 text-sm font-black ${
                              isCorrect
                                ? "bg-[#edfff6] text-emerald-700"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {isCorrect
                              ? "Correct ✅"
                              : `Wrong ❌ Correct answer: ${item.answer}`}
                          </p>

                          <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#655d80]">
                            <span className="font-black text-[#15132b]">
                              Why?
                            </span>{" "}
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
