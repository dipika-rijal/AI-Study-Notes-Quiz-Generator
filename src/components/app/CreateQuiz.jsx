import { useState } from "react";

export default function CreateQuiz() {
  const [inputType, setInputType] = useState("topic");
  const [questionCount, setQuestionCount] = useState(5);
  const [input, setInput] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const tabs = [
    {
      id: "topic",
      label: "Topic",
      icon: "⌕",
      placeholder: "e.g. Cell biology, React basics, Machine Learning...",
    },
    {
      id: "content",
      label: "Paste Content",
      icon: "▤",
      placeholder: "Paste your notes or study content here...",
    },
    {
      id: "video",
      label: "Video Link",
      icon: "⌁",
      placeholder: "Paste a YouTube video link here...",
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === inputType);

  function handleGenerateQuiz() {
    const questions = Array.from({ length: questionCount }, (_, index) => ({
      question: `Mock question ${index + 1}: What is the main idea of ${
        input || "this topic"
      }?`,
      options: ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      answer: "B. Second option",
    }));

    setGeneratedQuiz(questions);
  }

  function handleClear() {
    setInput("");
    setQuestionCount(5);
    setGeneratedQuiz(null);
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
            Generate practice questions from your study material.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-orange-100 bg-white/85 p-6 shadow-xl shadow-orange-100/60">
          <h2 className="mb-5 text-lg font-black text-[#15132b]">
            What should the quiz cover?
          </h2>

          <div className="mb-5 grid grid-cols-3 rounded-2xl bg-[#f3eee8] p-1">
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

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={currentTab.placeholder}
            className="min-h-[170px] w-full resize-none rounded-3xl border border-transparent bg-[#f3eee8] px-5 py-4 font-semibold leading-7 text-[#15132b] outline-none transition placeholder:text-[#b7adc4] focus:border-orange-400 focus:bg-white"
          />

          <label className="mt-5 block text-sm font-black text-[#8a83a5]">
            Number of questions
          </label>

          <div className="mt-2 grid grid-cols-3 gap-3">
            {[5, 10, 15].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`rounded-2xl px-5 py-3 font-black transition ${
                  questionCount === count
                    ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-100"
                    : "bg-[#f3eee8] text-[#9a93b3] hover:bg-[#fff5ec]"
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleGenerateQuiz}
              disabled={!input.trim()}
              className="flex-1 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-4 font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✨ Generate Quiz
            </button>

            <button
              onClick={handleClear}
              className="rounded-2xl border border-orange-100 bg-white px-5 py-4 font-black text-[#8a83a5] transition hover:bg-[#fff5ec]"
            >
              Clear
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-orange-100 bg-white/85 shadow-xl shadow-orange-100/60">
          <div className="border-b border-orange-100 px-6 py-5">
            <h2 className="text-lg font-black text-[#15132b]">
              Generated Quiz
            </h2>
          </div>

          <div className="min-h-[455px] p-6">
            {!generatedQuiz ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#fff0d0] text-3xl text-orange-500">
                  ◎
                </div>
                <h3 className="font-black text-[#8a83a5]">
                  Your quiz will appear here
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#b0a8c2]">
                  Enter a topic or paste content, choose question count, then
                  click Generate Quiz.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuiz.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-orange-100 bg-[#fffaf3] p-5"
                  >
                    <h3 className="mb-4 font-black leading-7 text-[#15132b]">
                      {index + 1}. {item.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {item.options.map((option) => (
                        <div
                          key={option}
                          className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#77718f]"
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