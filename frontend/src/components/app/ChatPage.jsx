import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useConversationFlow } from "../../hooks/useConversationFlow";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AINeuralCore from "../ai/AINeuralCore";

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
    const response = await fetch(`http://localhost:5000/api/notes/${noteId}`);
    if (!response.ok) {
      throw new Error("Saved note not found");
    }
    const result = await response.json();
    return result.note;
  };

  const {
    messages,
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

  const [showCore, setShowCore] = useState(false);
  const [coreSuccess, setCoreSuccess] = useState(false);

  useEffect(() => {
    if (loadingState !== "none" && loadingState !== "generating") {
      setShowCore(true);
      setCoreSuccess(false);
    } else if (showCore && loadingState === "none") {
      // Finished loading, show success memory visualization
      setCoreSuccess(true);
      const timer = setTimeout(() => {
        setShowCore(false);
        setCoreSuccess(false);
      }, 3000); // Wait 3 seconds to show knowledge added
      return () => clearTimeout(timer);
    }
  }, [loadingState, showCore]);

  // Automatically scroll to the bottom of the message container on new updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  const isGenerating = conversationStep === "generating";

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-transparent">
      {/* Chat header area */}
      <header className="mb-4 flex items-center justify-between border-b border-[var(--theme-glass-border)] pb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-xl text-[var(--color-primary-600)]">
            ✦
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.025em] text-[var(--theme-text-primary)]">
              AI Study Assistant
            </h1>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Generate, summarize, quiz, or learn anything.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={actions.resetChat}
          aria-label="Start a new chat session"
          className="rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--theme-text-secondary)] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
        >
          🗑 Start Over
        </button>
      </header>

      <AnimatePresence>
        {showCore && (
          <AINeuralCore
            loadingState={loadingState === "none" ? "success" : loadingState}
            isSuccess={coreSuccess}
          />
        )}
      </AnimatePresence>

      {/* Main Conversation viewport */}
      <main
        ref={scrollContainerRef}
        className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-5 md:p-6"
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
