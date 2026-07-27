import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA({ openModal }) {
  return (
    <section id="about" className="relative mx-auto max-w-6xl overflow-hidden rounded-[42px] border border-[#e2eadc] bg-white px-6 py-20 text-center shadow-[0_20px_60px_-15px_rgba(83,105,76,0.12)]">
      <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#e9f4e3]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#fff5c9]/65 blur-3xl" />
      <h2 className="relative mx-auto max-w-2xl text-4xl font-black leading-tight tracking-[-0.05em] text-[#171a14] md:text-6xl">Ready to make studying feel easier?</h2>
      <p className="relative mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#596154]">Paste your notes and get organized revision material in seconds — no account needed to try.</p>
      <button onClick={() => openModal("notes")} className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#171a14] px-7 py-4 font-black text-white shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:bg-[#30362a] hover:shadow-xl">
        <Sparkles size={18} /> Get Started <ArrowRight size={18} />
      </button>
    </section>
  );
}
