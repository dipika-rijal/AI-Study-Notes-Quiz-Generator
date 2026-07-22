import HeroPreview from "./HeroPreview";
import { Button, Badge } from "../../design-system";

export default function Hero({ openModal }) {
  return (
    <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:py-24">
      <div>
        <Badge variant="primary" size="md" className="mb-6">
          ✦ AI Study Assistant
        </Badge>

        <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.07em] text-[#15132b] md:text-7xl">
          Your Study Material,{" "}
          <span className="bg-gradient-to-r from-[#6757ff] via-[#8b5cf6] to-[#ff9f6e] bg-clip-text text-transparent">
            Organized
          </span>{" "}
          in Seconds
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-8 text-[#77718f]">
          Create clean notes, quick summaries, and practice questions from the
          content you already have.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-extrabold text-[#8a83a5]">
          <span>Start from:</span>
          <Badge variant="primary" size="sm">
            ⌕ Topic
          </Badge>
          <Badge variant="secondary" size="sm">
            ☘ Paste Content
          </Badge>
          <Badge variant="warning" size="sm">
            ⌁ Video Link
          </Badge>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            onClick={() => openModal("notes")}
            size="lg"
            variant="primary"
          >
            Make Notes →
          </Button>

          <Button
            onClick={() => openModal("quiz")}
            size="lg"
            variant="outline"
          >
            ◎ Start Quiz
          </Button>
        </div>

        <p className="mt-5 text-sm font-semibold text-[#9a93b3]">
          No boring setup. Start with what you already have.
        </p>
      </div>

      <HeroPreview />
    </section>
  );
}