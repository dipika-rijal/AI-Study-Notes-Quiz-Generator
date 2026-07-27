import { describe, expect, it } from "vitest";
import { normalizeFlashcards } from "./flashcards";

describe("normalizeFlashcards", () => {
  it("accepts the canonical flashcards response", () => {
    expect(normalizeFlashcards({ flashcards: [{ front: "Term", back: "Definition" }] }))
      .toEqual([{ front: "Term", back: "Definition" }]);
  });

  it("accepts common AI response variants and removes incomplete cards", () => {
    expect(normalizeFlashcards({ cards: [
      { question: "What is photosynthesis?", answer: "How plants make food" },
      { term: "Incomplete" }
    ] })).toEqual([
      { front: "What is photosynthesis?", back: "How plants make food" }
    ]);
  });
});
