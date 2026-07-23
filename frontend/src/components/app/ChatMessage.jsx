import { lazy, Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Copy, RotateCcw } from 'lucide-react';
import MarkdownRenderer from "./MarkdownRenderer";
import SuggestionChips from "./SuggestionChips";
import NotesCard from "./NotesCard";

// Lazy load heavy components for performance
const InteractiveQuiz = lazy(() => import("./InteractiveQuiz"));
const FlashcardViewer = lazy(() => import("./FlashcardViewer"));

/**
 * Message bubble container in the chat transcript.
 * Supports lazy loading widgets, text markdown parsing, and selection chip rendering.
 * 
 * @param {object} props
 * @param {object} props.message - Message data object.
 * @param {function} props.onSelectOption - Callback for option chip selection.
 * @param {function} props.onSaveNote - Callback to save generated study notes.
 * @param {function} props.onRegenerate - Callback to trigger note regeneration.
 * @param {boolean} props.isGenerating - Parent loading state.
 * @param {function} props.onUpdateMessage - Callback to update message state (e.g. quiz answers).
 */
export default function ChatMessage({
  message,
  onSelectOption,
  onSaveNote,
  onRegenerate,
  isGenerating,
  onUpdateMessage
}) {
  const { role, content, type, options, data, title, category, saved, dbNoteId } = message;
  const isUser = role === "user";
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="hidden h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-[var(--color-primary-500)] text-base text-white">
          ✦
        </div>
      )}

      {/* Bubble Wrapper */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Username/Label header */}
        <span className="mb-1.5 text-[11px] font-medium tracking-wide text-[var(--theme-text-muted)] select-none">
          {isUser ? "You" : "StudyGen AI"}
        </span>

        {/* Bubble Layout Content */}
        {type === "notes" ? (
          <NotesCard
            msgId={message.id}
            content={content}
            title={title}
            category={category}
            saved={saved}
            dbNoteId={dbNoteId}
            onSave={onSaveNote}
            onRegenerate={onRegenerate}
            isGenerating={isGenerating}
          />
        ) : type === "quiz" ? (
          <Suspense fallback={<div className="p-4 bg-purple-50 rounded-2xl animate-pulse text-xs text-[#6757ff]">Loading Quiz...</div>}>
            <InteractiveQuiz 
              data={data} 
              initialAnswers={message.quizState || {}}
              onAnswerUpdate={(quizState) => {
                if (onUpdateMessage) onUpdateMessage(message.id, { quizState });
              }} 
            />
          </Suspense>
        ) : type === "flashcards" ? (
          <Suspense fallback={<div className="p-4 bg-purple-50 rounded-2xl animate-pulse text-xs text-[#6757ff]">Loading Flashcards...</div>}>
            <FlashcardViewer data={data} />
          </Suspense>
        ) : (
          <div
            className={`rounded-2xl px-5 py-4 shadow-sm dark:shadow-none leading-relaxed text-[15px] select-text
              ${
                isUser
                ? "bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-[var(--theme-text-primary)] rounded-tr-sm"
                : "bg-[var(--theme-bg-primary)] border border-[var(--theme-glass-border)] text-[var(--theme-text-primary)] rounded-tl-sm"
              }`}
          >
            {type === "loading" ? (
              <div className="flex items-center gap-2 text-purple-400 py-1 select-none">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
                <span className="text-2xs font-extrabold ml-1">{content}</span>
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-line">{content}</p>
            ) : message.id === "greeting" ? (
              <p className="text-[15px] font-medium leading-7">What would you like to study today? Choose an option below, or write your own request.</p>
            ) : (
              <MarkdownRenderer content={content} />
            )}
          </div>
        )}

        {!isUser && type !== "loading" && type !== "options" && (
          <div className="mt-2 flex items-center gap-1">
            <button type="button" onClick={() => navigator.clipboard?.writeText(content)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--theme-text-muted)] transition hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)]"><Copy size={12} /> Copy</button>
            <button type="button" onClick={onRegenerate} disabled={isGenerating} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--theme-text-muted)] transition hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)] disabled:opacity-40"><RotateCcw size={12} /> Retry</button>
          </div>
        )}

        {/* Action suggestion chips if this is an options message */}
        {type === "options" && (
          <SuggestionChips options={options} onSelect={onSelectOption} />
        )}
      </div>
    </motion.div>
  );
}
