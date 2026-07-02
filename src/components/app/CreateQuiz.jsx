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
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

    if (typeFromUrl === "content") {
      setInputType("content");
      return;
    }

    setInputType("topic");
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

    try {
      const quiz = await generateQuizWithAI(
        input,
        currentTab.label,
        questionCount
      );

      if (!Array.isArray(quiz) || quiz.length === 0) {
        throw new Error("AI did not return valid quiz questions.");
      }

      setGeneratedQuiz(quiz);
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

  function handleClear() {
    setInput("");
    setQuestionCount(5);
    setUploadedFileName("");
    setGeneratedQuiz(null);
    setErrorMessage("");

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
            onChange={(event) => setInput(event.target.value)}
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
                  Groq is generating your quiz...
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#b0a8c2]">
                  Creating {questionCount} questions from your input.
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
                {generatedQuiz.map((item, index) => (
                  <div
                    key={`${item.question}-${index}`}
                    className="rounded-3xl border border-orange-100 bg-[#fffaf3] p-5"
                  >
                    <h3 className="mb-4 font-black leading-7 text-[#15132b]">
                      {index + 1}. {item.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {item.options.map((option) => (
                        <div
                          key={option}
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                            option === item.answer
                              ? "bg-[#edfff6] text-emerald-700"
                              : "bg-white text-[#77718f]"
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 rounded-2xl bg-[#edfff6] px-4 py-3 text-sm font-black text-emerald-700">
                      Answer: {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
