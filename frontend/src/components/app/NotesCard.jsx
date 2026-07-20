import { useRef, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

/**
 * Renders notes output in a styled card inside the chat bubble.
 * Provides features to copy raw notes, save to history database, and download PDF.
 * 
 * @param {object} props
 * @param {string} props.msgId - Unique message ID for updating save status.
 * @param {string} props.content - Markdown notes text.
 * @param {string} [props.title] - Optional note title.
 * @param {string} [props.category] - Optional category tag.
 * @param {boolean} [props.saved] - Parent-maintained save status.
 * @param {string} [props.dbNoteId] - Note ID in the database.
 * @param {function} props.onSave - Parent save callback.
 * @param {function} props.onRegenerate - Parent regeneration callback.
 * @param {boolean} [props.isGenerating] - Parent loading/generating state.
 */
export default function NotesCard({
  msgId,
  content,
  title = "AI Study Notes",
  category = "General",
  saved = false,
  dbNoteId = null,
  onSave,
  onRegenerate,
  isGenerating = false
}) {
  const notesContainerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState(saved ? "saved" : "unsaved");
  const [savedId, setSavedId] = useState(dbNoteId);

  // Sync internal state when parent state updates
  if (saved && saveStatus === "unsaved") {
    setSaveStatus("saved");
  }
  if (dbNoteId && !savedId) {
    setSavedId(dbNoteId);
  }

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert("Notes copied as Markdown! 📋");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (saveStatus === "saving" || saveStatus === "saved") return;

    setSaveStatus("saving");
    try {
      // Build standard StudyGen note payload
      const payload = {
        title: title || "Study Notes",
        body: content,
        category: category || "General",
        summary: content.slice(0, 300) + (content.length > 300 ? "..." : ""),
        sourceType: "manual",
        sourceText: title || "",
        tags: [category].filter(Boolean)
      };

      const finalSavedId = await onSave(msgId, payload);
      setSavedId(finalSavedId);
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("unsaved");
      alert("Failed to save. Make sure backend is running.");
    }
  };

  const handleDownloadPDF = () => {
    if (!notesContainerRef.current) return;

    const renderedHTML = notesContainerRef.current.innerHTML;

    // Create a hidden print iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #15132b;
              margin: 40px;
              line-height: 1.65;
            }
            h1 { font-weight: 800; font-size: 26px; margin-bottom: 20px; border-bottom: 2px solid #6757ff; padding-bottom: 10px; color: #15132b; }
            h2 { font-weight: 800; font-size: 19px; margin-top: 30px; margin-bottom: 15px; color: #15132b; }
            h3 { font-weight: 800; font-size: 16px; margin-top: 20px; color: #15132b; }
            p { font-size: 14px; margin-bottom: 15px; color: #504975; }
            ul, ol { font-size: 14px; margin-bottom: 15px; padding-left: 20px; color: #504975; }
            li { margin-bottom: 6px; }
            strong { font-weight: 800; color: #15132b; }
            
            /* Styled callouts matching the design system */
            div { font-size: 14px; }
            .my-4 { margin-top: 16px; margin-bottom: 16px; }
            .p-4 { padding: 16px; }
            .rounded-2xl { border-radius: 16px; }
            .border { border: 1px solid; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .flex { display: flex; }
            .gap-3 { gap: 12px; }
            .items-start { align-items: flex-start; }
            
            /* Definition Callout (📌) */
            .bg-\\[\\#f6f3ff\\] { background-color: #f6f3ff !important; border-color: #efe7ff !important; color: #15132b !important; }
            /* Simple Explanation Callout (💡) */
            .bg-\\[\\#fffcf3\\] { background-color: #fffcf3 !important; border-color: #fffcf3 !important; color: #504975 !important; }
            /* Common Mistakes Callout (⚠️) */
            .bg-red-50\\/70 { background-color: #fef2f2 !important; border-color: #fee2e2 !important; color: #991b1b !important; }
            /* Exam Tips Callout (🎯) */
            .bg-\\[\\#edfff6\\] { background-color: #f0fdf4 !important; border-color: #dcfce7 !important; color: #166534 !important; }
            
            /* Code styling */
            pre { background: #18181b !important; color: #f4f4f5 !important; padding: 15px; border-radius: 12px; font-family: monospace; font-size: 12px; overflow-x: auto; margin: 20px 0; }
            code { font-family: monospace; font-size: 13px; font-weight: bold; color: #6757ff; background: #f3eee8; padding: 2px 4px; border-radius: 4px; }
            pre code { color: inherit; background: none; padding: 0; }
            
            /* Hidden utilities on print */
            .no-print { display: none !important; }
            
            @media print {
              body { margin: 20px; }
              button, .no-print { display: none !important; }
              h1, h2, h3 { page-break-after: avoid; }
              pre, blockquote, div { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #6757ff; font-weight: 800; margin-bottom: 5px;">
            StudyGen AI study guide
          </div>
          <div>${renderedHTML}</div>
        </body>
      </html>
    `);

    doc.close();

    // Trigger iframe printing
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Cleanup iframe
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
  };

  return (
    <div className="w-full rounded-3xl border border-purple-100 dark:border-[#424242] bg-white dark:bg-[#171717] p-5 shadow-sm dark:shadow-none shadow-purple-50">
      {/* Category header */}
      <div className="flex items-center justify-between border-b border-purple-50 dark:border-[#424242] pb-3 mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-[#6757ff] dark:text-[#10a37f]">
          📚 {category || "AI Notes"}
        </span>

        {/* Action badges */}
        <div className="flex gap-2">
          {saveStatus === "saved" && (
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-2.5 py-0.5 text-2xs font-extrabold text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none shadow-emerald-50 animate-fade-in">
              Saved to History ✓
            </span>
          )}
        </div>
      </div>

      {/* Renders visual markdown */}
      <div ref={notesContainerRef} className="notes-print-source">
        <MarkdownRenderer content={content} />
      </div>

      {/* Action panel */}
      <div className="flex flex-wrap gap-2.5 border-t border-purple-50 dark:border-[#424242] pt-4 mt-5 select-none">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === "saving" || saveStatus === "saved"}
          className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer shadow-sm
            ${
              saveStatus === "saved"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 cursor-default hover:translate-y-0 active:scale-100"
                : saveStatus === "saving"
                ? "bg-purple-50 dark:bg-[#2f2f2f] border border-purple-100 dark:border-[#424242] text-purple-400 dark:text-[#b4b4b4] cursor-wait hover:translate-y-0 active:scale-100"
                : "bg-[#6757ff] dark:bg-[#10a37f] border border-transparent text-white hover:bg-[#5444e6] dark:hover:bg-[#05503e] hover:shadow-md dark:hover:shadow-none"
            }`}
        >
          {saveStatus === "saved" ? "Saved ✓" : saveStatus === "saving" ? "Saving..." : "💾 Save to History"}
        </button>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="bg-white dark:bg-[#2f2f2f] border border-purple-100 dark:border-[#424242] hover:border-[#6757ff] dark:hover:border-[#10a37f] text-[#6757ff] dark:text-[#10a37f] hover:bg-[#fcfaff] dark:hover:bg-[#171717] px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 hover:-translate-y-0.5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none flex items-center gap-1.5 cursor-pointer"
        >
          📥 Download PDF
        </button>

        <button
          type="button"
          onClick={handleCopyMarkdown}
          aria-label="Copy notes as Markdown"
          title="Copy notes as Markdown"
          className="bg-white dark:bg-[#2f2f2f] border border-purple-100 dark:border-[#424242] hover:border-purple-200 dark:hover:border-gray-500 text-[#8a83a5] dark:text-[#b4b4b4] hover:bg-slate-50 dark:hover:bg-[#171717] h-9 w-9 rounded-xl text-xs font-black transition active:scale-95 hover:-translate-y-0.5 shadow-sm dark:shadow-none grid place-items-center cursor-pointer"
        >
          📋
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="bg-white dark:bg-[#2f2f2f] border border-purple-100 dark:border-[#424242] hover:border-purple-200 dark:hover:border-gray-500 text-[#8a83a5] dark:text-[#b4b4b4] hover:bg-slate-50 dark:hover:bg-[#171717] px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 hover:-translate-y-0.5 shadow-sm dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
        >
          🔄 Regenerate
        </button>
      </div>
    </div>
  );
}
