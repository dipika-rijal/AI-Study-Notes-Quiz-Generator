import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const pdf = {
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    splitTextToSize: vi.fn((value) => [value]),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn()
  };
  return { pdf, jsPDF: function jsPDF() { return pdf; } };
});

vi.mock("jspdf", () => ({ jsPDF: mocks.jsPDF }));

import { exportChatToPdf } from "./exportChatPdf";

describe("exportChatToPdf", () => {
  it("exports all supported message types and skips UI-only messages", () => {
    exportChatToPdf({
      title: "Biology: Cell Study",
      messages: [
        { id: "greeting", role: "assistant", type: "options" },
        { id: "one", role: "user", type: "text", content: "Explain cells" },
        { id: "two", role: "assistant", type: "notes", title: "Cell Notes", content: "Cells are basic units." },
        { id: "three", role: "assistant", type: "flashcards", data: { flashcards: [{ front: "Cell?", back: "Basic unit" }] } },
        {
          id: "four",
          role: "assistant",
          type: "quiz",
          data: { questions: [{ question: "What is a cell?", options: ["Unit", "Planet"], correctAnswer: "A" }] },
          quizState: { selectedAnswers: { 0: { selectedAnswer: "A" } } }
        },
        { id: "five", role: "assistant", type: "text", content: "Quiz complete", quizResult: { score: 1, totalQuestions: 1 } },
        { id: "six", role: "assistant", type: "loading", content: "Thinking..." }
      ]
    });

    const rendered = mocks.pdf.text.mock.calls.map(([value]) => value).join("\n");
    expect(rendered).toContain("Explain cells");
    expect(rendered).toContain("Cell Notes");
    expect(rendered).toContain("Q: Cell?");
    expect(rendered).toContain("A. Unit (correct, your answer)");
    expect(rendered).toContain("Final score: 1/1");
    expect(rendered).not.toContain("Thinking...");
    expect(mocks.pdf.save).toHaveBeenCalledWith(expect.stringMatching(/^StudyGenAI_Biology_Cell_Study_\d{4}-\d{2}-\d{2}\.pdf$/));
  });
});
