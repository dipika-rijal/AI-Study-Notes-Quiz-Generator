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
    <div className="prose prose-purple max-w-none text-[#504975] dark:text-[#ececec] leading-relaxed select-text">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-black text-[#15132b] dark:text-white mt-5 mb-3 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-black text-[#15132b] dark:text-white mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-black text-[#15132b] dark:text-white mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            const textContent = String(children);
            // Visual Callout check for special prefix lines
            if (textContent.startsWith("📌")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-[#f6f3ff] dark:bg-[#2f2f2f] border border-purple-100 dark:border-[#424242] text-[#15132b] dark:text-[#ececec] font-medium shadow-sm flex items-start gap-3">
                  <Pin className="w-5 h-5 shrink-0 text-purple-500" />
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("💡")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-[#fffcf3] dark:bg-[#2f2f2f] border border-amber-100 dark:border-amber-800/50 text-[#504975] dark:text-[#ececec] font-medium shadow-sm flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 shrink-0 text-amber-500" />
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("⚠️")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-red-50/70 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 font-medium shadow-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("🎯")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-[#edfff6] dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 font-medium shadow-sm flex items-start gap-3">
                  <Target className="w-5 h-5 shrink-0 text-emerald-500" />
                  <div>{children}</div>
                </div>
              );
            }
            return <p className="mb-3 text-[#504975] dark:text-[#b4b4b4] font-medium leading-7 whitespace-pre-line">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 space-y-2 text-[#504975] dark:text-[#b4b4b4] font-medium">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-2 text-[#504975] dark:text-[#b4b4b4] font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => <strong className="font-extrabold text-[#15132b] dark:text-[#ececec]">{children}</strong>,
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            if (!inline && match) {
              return (
                <div className="my-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 font-mono shadow-lg">
                  <pre className="overflow-x-auto p-4 text-sm leading-6">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            if (!inline) {
              return (
                <div className="my-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 font-mono shadow-lg">
                  <pre className="overflow-x-auto p-4 text-sm leading-6">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code className="rounded bg-[#f3eee8] px-1.5 py-0.5 font-mono text-xs font-bold text-[#6757ff]" {...props}>
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
