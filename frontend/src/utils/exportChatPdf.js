import { jsPDF } from "jspdf";

const PAGE_MARGIN = 16;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const LINE_HEIGHT = 5.5;

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionText(option) {
  return typeof option === "string" ? option : text(option?.text);
}

function selectedLetter(question, selection) {
  const value = selection?.selectedAnswer ?? selection;
  if (typeof value === "string" && /^[A-D]$/.test(value.toUpperCase())) return value.toUpperCase();
  const index = (question?.options || []).findIndex((option) => optionText(option) === value);
  return index >= 0 ? String.fromCharCode(65 + index) : "";
}

function correctLetter(question) {
  const value = question?.correctAnswer || question?.answerLetter || question?.answer;
  if (typeof value === "string" && /^[A-D]$/.test(value.toUpperCase())) return value.toUpperCase();
  const index = (question?.options || []).findIndex((option) => optionText(option) === value);
  return index >= 0 ? String.fromCharCode(65 + index) : "";
}

function getQuizQuestions(data) {
  return Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
}

function safeFilePart(title) {
  const cleaned = text(title, "Chat").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  return cleaned || "Chat";
}

/** Downloads a conversation in its original chronological order as a PDF. */
export function exportChatToPdf(conversation) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
  let y = PAGE_MARGIN;

  const ensureSpace = (height) => {
    if (y + height <= PAGE_HEIGHT - PAGE_MARGIN) return;
    pdf.addPage();
    y = PAGE_MARGIN;
  };

  const writeLines = (value, { size = 10, color = [35, 35, 35], indent = 0, gap = 2 } = {}) => {
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    pdf.splitTextToSize(text(String(value)), CONTENT_WIDTH - indent).forEach((line) => {
      ensureSpace(LINE_HEIGHT);
      pdf.text(line, PAGE_MARGIN + indent, y);
      y += LINE_HEIGHT;
    });
    y += gap;
  };

  const writeHeading = (value, level = 1) => {
    ensureSpace(10);
    pdf.setFont("helvetica", "bold");
    writeLines(value, { size: level === 1 ? 18 : 13, color: [25, 25, 25], gap: 3 });
    pdf.setFont("helvetica", "normal");
  };

  writeHeading(text(conversation?.title, "StudyGenAI Chat"));
  writeLines(`Downloaded ${new Date().toLocaleDateString()}`, { size: 9, color: [105, 105, 105], gap: 6 });

  messages.forEach((message) => {
    if (!message || message.id === "greeting" || message.type === "loading" || message.type === "options") return;

    const role = message.role === "user" ? "You" : "StudyGen AI";
    ensureSpace(10);
    pdf.setFont("helvetica", "bold");
    writeLines(role, { size: 10, color: message.role === "user" ? [86, 74, 180] : [20, 120, 95], gap: 1 });
    pdf.setFont("helvetica", "normal");

    if (message.type === "notes") {
      writeHeading(text(message.title, "AI Study Notes"), 2);
      writeLines(text(message.content));
    } else if (message.type === "flashcards") {
      const cards = Array.isArray(message.data?.flashcards) ? message.data.flashcards : [];
      cards.forEach((card, index) => {
        pdf.setFont("helvetica", "bold");
        writeLines(`${index + 1}. Q: ${text(card?.front, "Question unavailable")}`, { gap: 1 });
        pdf.setFont("helvetica", "normal");
        writeLines(`A: ${text(card?.back, "Answer unavailable")}`, { indent: 4, gap: 2 });
      });
      if (!cards.length) writeLines("No flashcards were generated.");
    } else if (message.type === "quiz") {
      const questions = getQuizQuestions(message.data);
      const selections = message.quizState?.selectedAnswers || message.quizState || {};
      writeHeading(text(message.data?.topic, "Quiz"), 2);
      questions.forEach((question, index) => {
        pdf.setFont("helvetica", "bold");
        writeLines(`${index + 1}. ${text(question?.question || question?.questionText, `Question ${index + 1}`)}`, { gap: 1 });
        pdf.setFont("helvetica", "normal");
        const correct = correctLetter(question);
        const selected = selectedLetter(question, selections[index]);
        (question?.options || []).forEach((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          const markers = [letter === correct ? "correct" : "", letter === selected ? "your answer" : ""].filter(Boolean).join(", ");
          writeLines(`${letter}. ${optionText(option)}${markers ? ` (${markers})` : ""}`, { indent: 4, gap: 0.8 });
        });
        y += 1;
      });
      if (!questions.length) writeLines("No quiz questions were generated.");
    } else {
      writeLines(text(message.content));
    }

    if (message.quizResult) {
      const score = message.quizResult.score ?? message.quizResult.correctCount;
      const total = message.quizResult.totalQuestions ?? message.quizResult.total;
      if (score !== undefined && total !== undefined) {
        pdf.setFont("helvetica", "bold");
        writeLines(`Final score: ${score}/${total}`, { color: [20, 120, 95], gap: 3 });
        pdf.setFont("helvetica", "normal");
      }
    }

    y += 3;
  });

  pdf.save(`StudyGenAI_${safeFilePart(conversation?.title)}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
