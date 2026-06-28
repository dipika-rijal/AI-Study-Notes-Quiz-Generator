import HeroPreview from "./HeroPreview";

export default function Hero({ openModal }) {
  return (
    <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:py-24">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-[#eeeaff] px-4 py-2 text-sm font-extrabold text-[#6757ff] shadow-sm">
          ✦ AI Study Assistant
        </div>

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
          <span className="rounded-full border border-purple-200 bg-[#eeeaff] px-3 py-2 text-[#6757ff]">
            ⌕ Topic
          </span>
          <span className="rounded-full border border-emerald-200 bg-[#d9f7e8] px-3 py-2 text-emerald-700">
            ☘ Paste Content
          </span>
          <span className="rounded-full border border-orange-200 bg-[#fff1e6] px-3 py-2 text-orange-600">
            ⌁ Video Link
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => openModal("notes")}
            className="rounded-full bg-gradient-to-r from-[#6757ff] to-[#8b5cf6] px-7 py-4 font-extrabold text-white shadow-xl shadow-purple-300 transition hover:-translate-y-1"
          >
            Make Notes →
          </button>

          <button
            onClick={() => openModal("quiz")}
            className="rounded-full border border-purple-100 bg-white/80 px-7 py-4 font-extrabold text-[#15132b] shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            ◎ Start Quiz
          </button>
        </div>

        <p className="mt-5 text-sm font-semibold text-[#9a93b3]">
          No boring setup. Start with what you already have.
        </p>
      </div>

      <HeroPreview />
    </section>
  );
}