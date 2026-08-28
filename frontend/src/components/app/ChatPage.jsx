import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useConversationFlow } from "../../hooks/useConversationFlow";
import ChatMessage from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Download, Sparkles } from 'lucide-react';
import api from "../../api/axios";
import { exportChatToPdf } from "../../utils/exportChatPdf";

/**
 * Main Chat Container for the Conversational Note Assistant.
 * Coordinates conversation hook data, handles layout, auto-scroll, loaders, and actions.
 */
export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const savedNoteId = searchParams.get("savedNoteId");
  const conversationId = searchParams.get("conversationId");

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fetch saved note details from MongoDB database (called by conversation hook)
  const loadSavedNoteById = async (noteId) => {
    const response = await api.get(`/notes/${noteId}`);
    return response.data.note;
  };

  const {
    messages,
    conversation,
    conversationStep,
    loadingState,
    errorMessage,
    setErrorMessage,
    setLoadingState,
    actions
  } = useConversationFlow({
    conversationId,
    savedNoteId,
    loadSavedNoteById
  });

  // Automatically scroll to the bottom of the message container on new updates
  const scrollToBottom = () => {
    // Streaming updates arrive many times per second. Smooth-scrolling each
    // partial update creates a visible jumpy animation, so only animate once
    // the response is complete.
    messagesEndRef.current?.scrollIntoView({
      behavior: loadingState === "generating" ? "auto" : "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loadingState]);

  const isGenerating = conversationStep === "generating";
  const hasConversationMessages = messages.some((message) => message.id !== "greeting");

  return (
    <div className="mx-auto flex h-[calc(100vh-6.25rem)] lg:h-[calc(100vh-4rem)] w-full max-w-6xl flex-col bg-transparent">
      {/* Chat header area */}
      <header className="mb-2 flex flex-col gap-3 border-b border-[var(--theme-glass-border)] pb-3 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-lg text-[var(--color-primary-600)]">
            ✦
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-[-0.035em] text-[var(--theme-text-primary)]">
                Study Assistant
              </h1>
              <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[var(--color-primary-500)]"><Sparkles size={10} /> StudyGen AI</span>
            </div>
            <p className="text-xs leading-4 text-[var(--theme-text-secondary)]">
              Turn study material into clear notes, quizzes, and explanations.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:shrink-0">
          {hasConversationMessages && (
            <button
              type="button"
              onClick={() => exportChatToPdf(conversation)}
              aria-label="Download this chat as a PDF"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--theme-text-secondary)] transition hover:border-[var(--color-primary-500)]/40 hover:text-[var(--color-primary-600)] active:scale-95"
            >
              <Download size={14} /> Download Chat
            </button>
          )}
          <button
            type="button"
            onClick={actions.resetChat}
            aria-label="Start a new chat session"
            className="rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--theme-text-secondary)] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
          >
            🗑 Start Over
          </button>
        </div>
      </header>

      {/* Main Conversation viewport */}
      <main
        ref={scrollContainerRef}
        className="mb-4 flex-1 space-y-4 overflow-x-hidden overflow-y-auto rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-4 md:p-6"
      >
        <div className="mx-auto max-w-[900px] space-y-5">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSelectOption={actions.selectOption}
              onSaveNote={actions.saveNote}
              onRegenerate={actions.regenerateResponse}
              isGenerating={isGenerating}
              onUpdateMessage={actions.updateMessageData}
              onQuizSubmitted={actions.recordQuizCompletion}
            />
          ))}

          {/* Invisible anchor element to support auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Error Panel and recovery options */}
      {errorMessage && (
        <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 shadow-sm dark:shadow-none animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              ⚠️ {errorMessage}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={actions.regenerateResponse}
                className="rounded-lg bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 px-3 py-1.5 text-2xs font-extrabold transition"
              >
                🔄 Retry
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="rounded-lg bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 text-2xs font-extrabold transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom input widget */}
      <footer className="mx-auto w-full max-w-[920px] select-none">
        <ChatInput
          onSend={actions.sendMessage}
          onFileUpload={actions.uploadFile}
          disabled={isGenerating}
          loadingState={loadingState}
          setErrorMessage={setErrorMessage}
          setLoadingState={setLoadingState}
        />
        <div className="mt-2 text-center text-[10px] font-medium text-[var(--theme-text-muted)]">
          StudyGen AI can make mistakes. Verify important code or details.
        </div>
      </footer>
    </div>
  );
}
