import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { GraduationCap } from 'lucide-react';
import { useTutorFlow } from "../hooks/useTutorFlow";
import ChatMessage from "../components/app/MessageBubble";
import ChatInput from "../components/app/ChatInput";

export default function Tutor() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const {
    messages,
    loadingState,
    errorMessage,
    setErrorMessage,
    actions
  } = useTutorFlow(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: loadingState === "generating" ? "auto" : "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loadingState]);

  const isGenerating = loadingState === "generating";



  return (
    <div className="mx-auto flex h-[calc(100vh-6.25rem)] lg:h-[calc(100vh-4rem)] w-full max-w-6xl flex-col bg-transparent">
      {/* Header */}
      <header className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-glass-border)] pb-3 select-none">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-lg text-[var(--color-primary-600)]">
            <GraduationCap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-[-0.035em] text-[var(--theme-text-primary)]">
                AI Tutor
              </h1>
            </div>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Your personal AI teacher that remembers your weaknesses.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={actions.resetChat}
          className="w-fit rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--theme-text-secondary)] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
        >
          🗑 Clear
        </button>
      </header>

      {/* Main Conversation viewport */}
      <main
        ref={scrollContainerRef}
        className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-4 md:p-6"
      >
        <div className="mx-auto max-w-[900px] space-y-5">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isGenerating={isGenerating}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Error Panel */}
      {errorMessage && (
        <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              ⚠️ {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage("")}
              className="rounded-lg bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 text-2xs font-extrabold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <footer className="mx-auto w-full max-w-[920px] select-none">
        <ChatInput
          onSend={(text) => actions.sendMessage(text, null)}
          disabled={isGenerating}
          loadingState={loadingState}
          setErrorMessage={setErrorMessage}
          setLoadingState={() => {}}
        />
        <div className="mt-2 text-center text-[10px] font-medium text-[var(--theme-text-muted)]">
          Tutor adapts to your learning profile automatically.
        </div>
      </footer>
    </div>
  );
}
