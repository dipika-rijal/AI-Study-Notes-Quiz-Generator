const FRONT_KEYS = ["front", "question", "term", "prompt", "title"];
const BACK_KEYS = ["back", "answer", "definition", "explanation", "response", "content"];

function firstText(card, keys) {
  for (const key of keys) {
    const value = card?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/**
 * Converts supported AI response variants into the one card shape the UI uses.
 * It also lets previously saved chat messages remain readable after the schema
 * was made stricter.
 */
export function normalizeFlashcards(data) {
  const candidates = Array.isArray(data)
    ? data
    : Array.isArray(data?.flashcards)
      ? data.flashcards
      : Array.isArray(data?.cards)
        ? data.cards
        : Array.isArray(data?.items)
          ? data.items
          : [];

  return candidates
    .map((card) => ({
      front: firstText(card, FRONT_KEYS),
      back: firstText(card, BACK_KEYS)
    }))
    .filter((card) => card.front && card.back);
}
