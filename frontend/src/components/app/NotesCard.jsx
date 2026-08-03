import { useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

/**
 * Renders notes output in a styled card inside the chat bubble.
 * Provides features to copy raw notes and download text file.
 * 
 * @param {object} props
 * @param {string} props.msgId - Unique message ID for updating save status.
 * @param {string} props.content - Markdown notes text.
 * @param {string} [props.title] - Optional note title.
 * @param {string} [props.category] - Optional category tag.
 * @param {function} props.onRegenerate - Parent regeneration callback.
 * @param {boolean} [props.isGenerating] - Parent loading/generating state.
 */
export default function NotesCard({
  msgId,
  content,
  title = "AI Study Notes",
  category = "General"
}) {
  const notesContainerRef = useRef(null);

  const handleDownloadPDF = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "notes"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-3xl border border-purple-100 dark:border-[#424242] bg-white dark:bg-[#171717] p-6 md:p-8 shadow-sm dark:shadow-none shadow-purple-50">
      {/* Category header */}
      <div className="flex items-center justify-between border-b border-purple-50 dark:border-[#424242] pb-3 mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-[#6757ff] dark:text-[#10a37f]">
          📚 {category || "AI Notes"}
        </span>
      </div>

      {/* Renders visual markdown */}
      <div ref={notesContainerRef} className="notes-print-source">
        <MarkdownRenderer content={content} />
      </div>

      {/* Action panel */}
      <div className="flex flex-wrap gap-2.5 border-t border-purple-50 dark:border-[#424242] pt-4 mt-5 select-none">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="bg-white dark:bg-[#2f2f2f] border border-purple-100 dark:border-[#424242] hover:border-[#6757ff] dark:hover:border-[#10a37f] text-[#6757ff] dark:text-[#10a37f] hover:bg-[#fcfaff] dark:hover:bg-[#171717] px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 hover:-translate-y-0.5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none flex items-center gap-1.5 cursor-pointer"
        >
          📥 Download PDF
        </button>
      </div>
    </div>
  );
}

