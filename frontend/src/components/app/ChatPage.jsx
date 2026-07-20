import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useConversationFlow } from "../../hooks/useConversationFlow";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

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

  // Automatically scroll to the bottom of the message container on new updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  const isGenerating = conversationStep === "generating";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-transparent">
      {/* Chat header area */}
      <header className="flex items-center justify-between border-b border-purple-100/50 dark:border-[#424242] pb-4 mb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eeeaff] dark:bg-[#171717] dark:border dark:border-[#424242] text-xl text-[#6757ff] dark:text-[#10a37f] shadow-md shadow-purple-50 dark:shadow-none">
            ✦
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#15132b] dark:text-[#ececec]">
              AI Study Assistant
            </h1>
            <p className="text-xs font-semibold text-[#9a93b3] dark:text-[#999999]">
              Generate, summarize, quiz, or learn anything.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={actions.resetChat}
          aria-label="Start a new chat session"
          className="rounded-xl border border-purple-100 dark:border-[#424242] bg-white dark:bg-[#2f2f2f] hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-800/50 px-4 py-2 text-xs font-black text-[#8a83a5] dark:text-[#b4b4b4] transition active:scale-95 shadow-sm dark:shadow-none cursor-pointer"
        >
          🗑 Start Over
        </button>
      </header>

      {/* Action Loader Alert Panel */}
      {loadingState !== "none" && loadingState !== "generating" && (
        <div className="mb-4 flex items-center justify-center animate-pulse">
          <div className="flex items-center gap-2 rounded-2xl bg-[#eeeaff] dark:bg-[#171717] border border-purple-100 dark:border-[#10a37f]/50 px-4 py-2 text-2xs font-extrabold text-[#6757ff] dark:text-[#10a37f] shadow-md shadow-purple-100/50 dark:shadow-none">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#6757ff] dark:bg-[#10a37f]" />
            <span>
              {loadingState === "thinking" && "Searching Note..."}
              {loadingState === "uploading" && "Reading Document..."}
              {loadingState === "extracting" && "Extracting PDF contents..."}
              {loadingState === "saving" && "Saving to History database..."}
              {loadingState === "downloading" && "Formatting print sheet..."}
            </span>
          </div>
        </div>
      )}

      {/* Main Conversation viewport */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto rounded-[32px] border border-purple-100 dark:border-[#424242] bg-white/70 dark:bg-[#171717] p-5 md:p-6 shadow-xl shadow-purple-100/40 dark:shadow-none space-y-4 mb-4"
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
        <div className="mt-2 text-center text-[10px] font-semibold text-[#b0a8c2]">
          StudyGen AI can make mistakes. Verify important code or details.
        </div>
      </footer>
    </div>
  );
}
