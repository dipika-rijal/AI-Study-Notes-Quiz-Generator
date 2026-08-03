import { useRef, useEffect } from "react";
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
  category = "General",
  saved,
  onSave,
  isGenerating
}) {
  const notesContainerRef = useRef(null);
  const hasAttemptedSave = useRef(false);

  useEffect(() => {
    // Auto-save the note once generation is complete
    if (!isGenerating && onSave && !saved && !hasAttemptedSave.current) {
      hasAttemptedSave.current = true;
      onSave();
    }
  }, [isGenerating, onSave, saved]);



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


    </div>
  );
}

