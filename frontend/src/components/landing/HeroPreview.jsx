export default function HeroPreview() {
  return (
    <div className="relative min-h-[560px]">
      <div className="absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_45%_12%,rgba(103,87,255,0.13),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(255,216,182,0.45),transparent_32%)]" />

      <div className="absolute left-8 top-2 rounded-full border border-purple-100 bg-white/80 px-4 py-2 text-xs font-black text-[#6757ff] shadow-lg">
        cozy revision ✨
      </div>

      <div className="absolute bottom-24 left-14 rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-xs font-black text-orange-500 shadow-lg">
        quiz ready
      </div>

      <div className="absolute right-0 top-[320px] rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-black text-emerald-600 shadow-lg">
        summary made
      </div>

      <div className="absolute left-1/2 top-10 w-[92%] max-w-[380px] -translate-x-1/2 rotate-1 rounded-3xl border border-purple-100 bg-white/85 p-5 shadow-2xl shadow-purple-200/60 backdrop-blur-xl transition hover:-translate-y-1 sm:left-auto sm:right-4 sm:translate-x-0">
        <div className="mb-4 flex items-center justify-between text-[13px] font-extrabold tracking-tight text-[#15132b]">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <span>my-notes.txt</span>

          <span className="rounded-full bg-[#eeeaff] px-3 py-1 text-[#6757ff]">
            raw
          </span>
        </div>

        <div className="space-y-3">
          <div className="h-2.5 w-[92%] rounded-full bg-[#edeaf5]" />
          <div className="h-2.5 w-[76%] rounded-full bg-[#edeaf5]" />
          <div className="h-2.5 w-[86%] rounded-full bg-[#edeaf5]" />
          <div className="h-2.5 w-[58%] rounded-full bg-[#edeaf5]" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f0edf8] px-3 py-1 text-xs font-bold text-[#837ca0]">
            chapter
          </span>
          <span className="rounded-full bg-[#f0edf8] px-3 py-1 text-xs font-bold text-[#837ca0]">
            topic
          </span>
          <span className="rounded-full bg-[#f0edf8] px-3 py-1 text-xs font-bold text-[#837ca0]">
            class notes
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 top-[230px] z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-purple-100 bg-white/60 px-3 py-2 shadow-lg backdrop-blur-md sm:left-[45%] sm:translate-x-0">
        <span className="h-2 w-2 rounded-full bg-[#d8d0ff]" />
        <span className="h-2 w-2 rounded-full bg-[#c5b8ff]" />
        <span className="h-2 w-2 rounded-full bg-[#a996ff]" />
      </div>

      <div className="absolute left-1/2 top-[260px] w-[92%] max-w-[330px] -translate-x-1/2 -rotate-1 rounded-3xl border border-purple-100 bg-white/85 p-5 shadow-2xl shadow-purple-200/60 backdrop-blur-xl transition hover:-translate-y-1 sm:left-0 sm:translate-x-0">
        <div className="mb-4 flex items-center justify-between text-[13px] font-extrabold tracking-tight text-[#15132b]">
          <span>▣ Clean Summary</span>
          <span className="rounded-full bg-[#eeeaff] px-3 py-1 text-[#6757ff]">
            AI
          </span>
        </div>

        <div className="mb-4 h-2.5 w-full rounded-full bg-gradient-to-r from-[#9a88ff] to-[#e7ddff]" />

        <div className="space-y-3">
          <div className="h-2.5 w-[90%] rounded-full bg-[#edeaf5]" />
          <div className="h-2.5 w-[74%] rounded-full bg-[#edeaf5]" />
          <div className="h-2.5 w-[64%] rounded-full bg-[#edeaf5]" />
        </div>

        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-[#f0edf8] px-3 py-1 text-xs font-bold text-[#837ca0]">
            concept
          </span>
          <span className="rounded-full bg-[#f0edf8] px-3 py-1 text-xs font-bold text-[#837ca0]">
            key idea
          </span>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 w-[92%] max-w-[390px] -translate-x-1/2 rotate-1 rounded-3xl border border-purple-100 bg-white/85 p-5 shadow-2xl shadow-purple-200/60 backdrop-blur-xl transition hover:-translate-y-1 sm:left-auto sm:right-2 sm:translate-x-0">
        <div className="mb-4 flex items-center justify-between text-[13px] font-extrabold tracking-tight text-[#15132b]">
          <span>◎ Practice Quiz</span>
          <span className="rounded-full bg-[#fff0d0] px-3 py-1 text-orange-500">
            MCQ
          </span>
        </div>

        <div className="mb-4 h-2.5 w-[94%] rounded-full bg-gradient-to-r from-yellow-400 to-yellow-100" />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-full bg-[#f3f0f9] px-4 py-2 text-xs font-black text-[#8a83a5]">
            A
          </div>

          <div className="flex justify-between rounded-full border border-purple-200 bg-[#eeeaff] px-4 py-2 text-xs font-black text-[#6757ff]">
            B <span>●</span>
          </div>

          <div className="rounded-full bg-[#f3f0f9] px-4 py-2 text-xs font-black text-[#8a83a5]">
            C
          </div>

          <div className="rounded-full bg-[#f3f0f9] px-4 py-2 text-xs font-black text-[#8a83a5]">
            D
          </div>
        </div>
      </div>
    </div>
  );
}