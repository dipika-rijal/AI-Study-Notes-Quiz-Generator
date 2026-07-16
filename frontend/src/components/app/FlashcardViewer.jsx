import { useState } from "react";

/**
 * Interactive Flippable Flashcard Carousel widget.
 * Uses lightweight 3D transform CSS properties for the flip animation.
 * 
 * @param {object} props
 * @param {object} props.data - JSON flashcard payload containing { flashcards: [...] }
 */
export default function FlashcardViewer({ data }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = data && Array.isArray(data.flashcards) ? data.flashcards : [];

  if (cards.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-semibold">
        No flashcards found in this response.
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="w-full rounded-3xl border border-purple-100 bg-white p-5 shadow-sm shadow-purple-50 space-y-5 select-none">
      <div className="flex items-center justify-between border-b border-purple-50 pb-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#6757ff]">
          🧠 Flashcards
        </span>
        <span className="text-xs font-semibold text-[#8a83a5]">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* 3D Flippable Card Frame */}
      <div className="h-[220px] w-full perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className={`relative h-full w-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-purple-100 bg-[#fffdf9] p-6 text-center backface-hidden shadow-inner hover:shadow-md transition">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#9a93b3] mb-3">Front (Click to flip)</span>
            <h3 className="text-base font-black text-[#15132b] leading-relaxed max-w-sm">
              {currentCard.front}
            </h3>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 text-center backface-hidden rotate-y-180 shadow-inner">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-3">Back</span>
            <p className="text-sm font-semibold text-[#504975] leading-relaxed max-w-sm">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous card"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee8] hover:bg-[#eeeaff] text-[#6757ff] font-bold active:scale-95 transition cursor-pointer"
        >
          ←
        </button>

        <span className="text-2xs font-extrabold text-[#9a93b3]">
          Click card to flip
        </span>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next card"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee8] hover:bg-[#eeeaff] text-[#6757ff] font-bold active:scale-95 transition cursor-pointer"
        >
          →
        </button>
      </div>

      {/* Add perspective utility CSS inside a style block since Tailwind perspective isn't standard in v4 without extensions */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
