import ReactMarkdown from "react-markdown";

/**
 * Beautiful Markdown renderer with custom elements (pre, code, callouts, lists).
 * Uses react-markdown to render.
 * 
 * @param {object} props
 * @param {string} props.content - Markdown text to render.
 */
export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose prose-purple max-w-none text-[#504975] leading-relaxed select-text">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-black text-[#15132b] mt-5 mb-3 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-black text-[#15132b] mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-black text-[#15132b] mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            const textContent = String(children);
            // Visual Callout check for special prefix lines
            if (textContent.startsWith("📌")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-[#f6f3ff] border border-purple-100 text-[#15132b] font-medium shadow-sm flex items-start gap-3">
                  <span className="text-lg">📌</span>
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("💡")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-[#fffcf3] border border-amber-100 text-[#504975] font-medium shadow-sm flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("⚠️")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-red-50/70 border border-red-100 text-red-700 font-medium shadow-sm flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>{children}</div>
                </div>
              );
            }
            if (textContent.startsWith("🎯")) {
              return (
                <div className="my-4 p-4 rounded-2xl bg-[#edfff6] border border-emerald-100 text-emerald-800 font-medium shadow-sm flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <div>{children}</div>
                </div>
              );
            }
            return <p className="mb-3 text-[#504975] font-medium leading-7 whitespace-pre-line">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 space-y-2 text-[#504975] font-medium">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-2 text-[#504975] font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => <strong className="font-extrabold text-[#15132b]">{children}</strong>,
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
