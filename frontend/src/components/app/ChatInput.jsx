import { useState, useRef, useEffect } from "react";
import pdfToText from "react-pdftotext";
import AttachmentMenu from './AttachmentMenu';

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
  const imageInputRef = useRef(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

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

    if (file.type.startsWith("image/")) {
      setErrorMessage("Please use the Upload Image option for images.");
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
    } else {
      setLoadingState("uploading");
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          onFileUpload(fileName, text, fileSize);
          setLoadingState("none");
        };
        reader.onerror = () => {
          setErrorMessage("Failed to read file.");
          setLoadingState("none");
        };
        reader.readAsText(file);
      } catch (err) {
        console.error(err);
        setErrorMessage("An error occurred reading the file.");
        setLoadingState("none");
      }
    }

    // Reset file input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isInputLoading = loadingState !== "none" && loadingState !== "saving" && loadingState !== "downloading";

  const handleAttachmentSelect = (action) => {
    setIsAttachmentMenuOpen(false);
    if (action === 'file') fileInputRef.current?.click();
    if (action === 'image') imageInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) setErrorMessage('Image analysis is not enabled by the current AI API. Please add a note or upload a PDF.');
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-2 shadow-lg shadow-black/[0.03] transition focus-within:border-[var(--color-primary-500)] focus-within:ring-4 focus-within:ring-[var(--color-primary-500)]/10">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isInputLoading}
        />
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={disabled || isInputLoading} />
        {isAttachmentMenuOpen && <AttachmentMenu onSelect={handleAttachmentSelect} disabled={disabled || isInputLoading} />}

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setIsAttachmentMenuOpen((open) => !open)}
          disabled={disabled || isInputLoading}
          aria-label="Add an attachment"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-transparent transition before:absolute before:text-2xl before:font-light before:leading-none before:text-[var(--theme-text-secondary)] before:content-['+'] hover:before:text-[var(--theme-text-primary)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-500)] text-transparent transition after:absolute after:text-lg after:font-semibold after:leading-none after:text-white after:content-['↑'] hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ✦
        </button>
      </form>
    </div>
  );
}
