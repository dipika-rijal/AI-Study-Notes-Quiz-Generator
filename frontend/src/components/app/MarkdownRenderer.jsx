import ReactMarkdown from "react-markdown";
import { Pin, Lightbulb, AlertTriangle, Target } from "lucide-react";

/**
 * Beautiful Markdown renderer with custom elements (pre, code, callouts, lists).
 * Uses react-markdown to render.
 * 
 * @param {object} props
 * @param {string} props.content - Markdown text to render.
 */
export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-purple max-w-none text-[var(--theme-text-primary)] leading-relaxed select-text">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-black text-[var(--theme-text-primary)] mt-6 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-[var(--theme-text-primary)] mt-6 mb-3 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mt-5 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            const textContent = String(children);
            // Visual Callout check for special prefix lines
            if (textContent.startsWith("📌")) {
              return (
                <div className="my-5 p-4 rounded-2xl bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-[var(--theme-text-primary)] font-medium shadow-sm flex items-start gap-3">
                  <Pin className="w-5 h-5 shrink-0 text-[var(--color-primary-500)]" />
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("💡")) {
              return (
                <div className="my-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 text-[var(--theme-text-primary)] font-medium shadow-sm flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 shrink-0 text-amber-500" />
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("⚠️")) {
              return (
                <div className="my-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-[var(--theme-text-primary)] font-medium shadow-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("🎯")) {
              return (
                <div className="my-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-[var(--theme-text-primary)] font-medium shadow-sm flex items-start gap-3">
                  <Target className="w-5 h-5 shrink-0 text-emerald-500" />
                  <div>{children}</div>
                </div>
              );
            }
            return <p className="mb-4 text-[var(--theme-text-secondary)] font-medium leading-7 whitespace-pre-line">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-5 space-y-2 text-[var(--theme-text-secondary)] font-medium">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-5 space-y-2 text-[var(--theme-text-secondary)] font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-[var(--theme-text-primary)] dark:text-white drop-shadow-sm">{children}</strong>,
          code: ({ className, children, node, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = match || String(children).includes("\n");

            if (isBlock) {
              return (
                <div className="my-5 overflow-hidden rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] shadow-sm">
                  <pre className="overflow-x-auto p-4 text-sm leading-6 text-[var(--theme-text-primary)]">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            return (
              <code className="rounded-md bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] px-1.5 py-0.5 font-mono text-[13px] font-medium text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
