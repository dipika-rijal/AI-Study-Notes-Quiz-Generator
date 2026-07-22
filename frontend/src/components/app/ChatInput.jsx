import { useState, useRef, useEffect } from "react";
import pdfToText from "react-pdftotext";

/**
 * Sticky input box with auto-growing textarea and attachment button.
 * 
 * @param {object} props
 * @param {function} props.onSend - Callback when text message is submitted.
 * @param {function} props.onFileUpload - Callback when file is parsed.
 * @param {boolean} props.disabled - Disables input.
 * @param {string} props.loadingState - Current action loader state.
 * @param {function} props.setErrorMessage - Callback to set parent level errors.
 * @param {function} props.setLoadingState - Callback to toggle parent loaders.
 */
export default function ChatInput({
  onSend,
  onFileUpload,
  disabled,
  loadingState,
  setErrorMessage,
  setLoadingState
}) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-grow textarea height on value change
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to compute scrollHeight accurately
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [inputValue]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || disabled) return;

    onSend(inputValue.trim());
    setInputValue("");
    
    // Reset textarea height to default
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter, unless Shift is pressed
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    setErrorMessage("");
    const fileName = file.name;
    const fileSize = file.size;
    const cleanName = fileName.toLowerCase();

    // Check size limit: 2MB
    if (fileSize > 2 * 1024 * 1024) {
      setErrorMessage("File is too large. Please upload files under 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (cleanName.endsWith(".pdf")) {
      setLoadingState("extracting");
      try {
        const text = await pdfToText(file);
        if (!text || !text.trim()) {
          onFileUpload(fileName, "", fileSize, {
            requiresOcr: true,
            extractionError: "Parsed PDF was empty or unreadable."
          });
          return;
        }
        onFileUpload(fileName, text, fileSize);
      } catch (err) {
        console.error("PDF Parsing Error", err);
        onFileUpload(fileName, "", fileSize, {
          requiresOcr: true,
          extractionError: err?.message || "Failed to extract text from the PDF."
        });
      } finally {
        setLoadingState("none");
      }
    } else if (cleanName.endsWith(".txt") || cleanName.endsWith(".md")) {
      setLoadingState("uploading");
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          onFileUpload(fileName, text, fileSize);
          setLoadingState("none");
        };
        reader.onerror = () => {
          setErrorMessage("Failed to read text file.");
          setLoadingState("none");
        };
        reader.readAsText(file);
      } catch (err) {
        console.error(err);
        setErrorMessage("An error occurred reading the text file.");
        setLoadingState("none");
      }
    } else {
      setErrorMessage("Unsupported file type. Please upload a .pdf, .txt, or .md file.");
    }

    // Reset file input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isInputLoading = loadingState !== "none" && loadingState !== "saving" && loadingState !== "downloading";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-2 transition focus-within:border-[var(--color-primary-500)]">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isInputLoading}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isInputLoading}
          aria-label="Upload document (PDF, TXT, or MD)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition hover:text-[var(--theme-text-primary)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          📎
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isInputLoading
              ? "AI is working..."
              : "Ask me to generate notes, summarize files, or paste a topic..."
          }
          disabled={disabled || isInputLoading}
          rows={1}
          style={{ height: "auto" }}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm font-medium leading-relaxed text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-muted)] disabled:cursor-not-allowed"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || isInputLoading || !inputValue.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-500)] text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ✦
        </button>
      </form>
    </div>
  );
}
