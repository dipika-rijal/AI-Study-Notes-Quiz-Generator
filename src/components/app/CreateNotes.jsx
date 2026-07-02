import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { generateNotesWithAI } from "../../services/ai";

export default function CreateNotes() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [inputType, setInputType] = useState("topic");
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const tabs = [
    {
      id: "topic",
      label: "Topic",
      icon: "⌕",
      placeholder: "e.g. React useState, Logistic Regression, Photosynthesis...",
    },
    {
      id: "content",
      label: "Upload / Paste",
      icon: "▤",
      placeholder: "Paste your class notes here or upload a .txt / .md file...",
    },
    {
      id: "video",
      label: "Video Link",
      icon: "⌁",
      placeholder:
        "Write the video title/topic or paste any short description here...",
    },
  ];

  useEffect(() => {
    const typeFromUrl = searchParams.get("type");

    if (["topic", "content", "video"].includes(typeFromUrl)) {
      setInputType(typeFromUrl);
    }
  }, [searchParams]);

  const currentTab = tabs.find((tab) => tab.id === inputType);

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

  function getFinalInputForAI() {
    if (inputType === "video") {
      return `
Video link:
${videoLink || "No video link provided"}

Video title/topic/details:
${input || "No extra video details provided"}
      `.trim();
    }

    return input;
  }

  async function handleGenerateNotes() {
    const finalInput = getFinalInputForAI();

    if (inputType === "video" && !videoLink.trim() && !input.trim()) {
      setErrorMessage("Please paste a video link or write the video topic/title first.");
      return;
    }

    if (inputType !== "video" && !input.trim()) {
      setErrorMessage("Please enter a topic, paste content, or upload a file first.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setGeneratedNotes(null);

    try {
      const notes = await generateNotesWithAI(finalInput, currentTab.label);

      setGeneratedNotes({
        title: title.trim() || notes.title || "Generated Notes",
        summary: notes.summary || "No summary generated.",
        points: Array.isArray(notes.points) ? notes.points : [],
        revisionLine:
          notes.revisionLine ||
          "Revise the summary and key points carefully.",
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.message ||
          "AI could not generate notes right now. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleClear() {
    setTitle("");
    setInput("");
    setVideoLink("");
    setUploadedFileName("");
    setGeneratedNotes(null);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eeeaff] text-2xl text-[#6757ff] shadow-md shadow-purple-100">
          ▤
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#15132b]">
            Create Notes
          </h1>

          <p className="mt-1 font-semibold text-[#9a93b3]">
            Generate real AI study notes from a topic, file, or video link.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-purple-100 bg-white/85 p-6 shadow-xl shadow-purple-100/60">
          <h2 className="mb-5 text-lg font-black text-[#15132b]">
            What would you like notes on?
          </h2>

          <div className="mb-5 grid grid-cols-3 rounded-2xl bg-[#f3eee8] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInputType(tab.id)}
                className={`rounded-xl px-3 py-3 text-xs font-black transition ${
                  inputType === tab.id
                    ? "bg-white text-[#6757ff] shadow-md"
                    : "text-[#9a93b3] hover:text-[#15132b]"
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {inputType === "content" && (
            <div className="mb-4 rounded-3xl border border-purple-100 bg-[#fffaf3] p-4">
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
                className="rounded-2xl bg-[#eeeaff] px-5 py-3 text-sm font-black text-[#6757ff] transition hover:-translate-y-0.5"
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

          {inputType === "video" && (
            <div className="mb-4 rounded-3xl border border-orange-100 bg-[#fffaf3] p-4">
              <label className="mb-2 block text-sm font-black text-[#15132b]">
                Video link
              </label>

              <input
                value={videoLink}
                onChange={(event) => setVideoLink(event.target.value)}
                placeholder="Paste YouTube or class video link here"
                className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 font-semibold text-[#15132b] outline-none transition placeholder:text-[#b7adc4] focus:border-[#6757ff]"
              />

              <p className="mt-3 text-xs font-bold leading-5 text-[#9a93b3]">
                For now, StudyGen cannot read full video transcript automatically.
                Add the video title/topic or short description below for better notes.
              </p>
            </div>
          )}

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={currentTab.placeholder}
            className="min-h-[190px] w-full resize-none rounded-3xl border border-transparent bg-[#f3eee8] px-5 py-4 font-semibold leading-7 text-[#15132b] outline-none transition placeholder:text-[#b7adc4] focus:border-[#6757ff] focus:bg-white"
          />

          <label className="mt-5 block text-sm font-black text-[#8a83a5]">
            Custom title optional
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Leave blank to let AI create a title"
            className="mt-2 w-full rounded-2xl border border-transparent bg-[#f3eee8] px-5 py-4 font-semibold text-[#15132b] outline-none transition placeholder:text-[#b7adc4] focus:border-[#6757ff] focus:bg-white"
          />

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
              {errorMessage}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleGenerateNotes}
              disabled={
                isGenerating ||
                (inputType === "video"
                  ? !videoLink.trim() && !input.trim()
                  : !input.trim())
              }
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#6757ff] to-[#b75cff] px-5 py-4 font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating with Groq..." : "✨ Generate Notes"}
            </button>

            <button
              onClick={handleClear}
              disabled={isGenerating}
              className="rounded-2xl border border-purple-100 bg-white px-5 py-4 font-black text-[#8a83a5] transition hover:bg-[#fff5ec] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-purple-100 bg-white/85 shadow-xl shadow-purple-100/60">
          <div className="border-b border-purple-100 px-6 py-5">
            <h2 className="text-lg font-black text-[#15132b]">
              Generated Notes
            </h2>
          </div>

          <div className="min-h-[455px] p-6">
            {isGenerating ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-3xl bg-[#eeeaff] text-3xl text-[#6757ff]">
                  ✨
                </div>

                <h3 className="font-black text-[#6757ff]">
                  Groq is generating your notes...
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#b0a8c2]">
                  Wait a few seconds. This is now using real AI.
                </p>
              </div>
            ) : !generatedNotes ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#eeeaff] text-3xl text-[#6757ff]">
                  ▤
                </div>

                <h3 className="font-black text-[#8a83a5]">
                  Your AI notes will appear here
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#b0a8c2]">
                  Enter a topic, paste content, upload a file, or add video details.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl bg-[#fffaf3] p-5">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#6757ff]">
                    AI Study Note
                  </p>

                  <h3 className="text-2xl font-black text-[#15132b]">
                    {generatedNotes.title}
                  </h3>
                </div>

                <div>
                  <h4 className="mb-2 font-black text-[#15132b]">Summary</h4>

                  <p className="leading-7 text-[#77718f]">
                    {generatedNotes.summary}
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-black text-[#15132b]">
                    Key Points
                  </h4>

                  <ul className="space-y-3">
                    {generatedNotes.points.map((point, index) => (
                      <li
                        key={`${point}-${index}`}
                        className="rounded-2xl bg-[#f7f2ff] px-4 py-3 text-sm font-semibold leading-6 text-[#655d80]"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-[#edfff6] p-5">
                  <p className="font-bold leading-7 text-emerald-700">
                    {generatedNotes.revisionLine}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
