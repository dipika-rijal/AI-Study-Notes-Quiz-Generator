export default function CTA({ openModal }) {
  return (
    <section
      id="about"
      className="mx-auto mb-20 max-w-6xl overflow-hidden rounded-[42px] bg-[radial-gradient(circle_at_10%_15%,rgba(255,216,182,0.24),transparent_25%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(135deg,#5b4dff,#8b5cf6_54%,#ff9f6e)] px-6 py-20 text-center text-white shadow-2xl shadow-purple-300"
    >
      <h2 className="mx-auto max-w-2xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-6xl">
        Ready to make studying feel easier?
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
        Paste your notes and get organized revision material in seconds — no
        account needed to try.
      </p>

      <button
        onClick={() => openModal("notes")}
        className="mt-8 rounded-full bg-white px-8 py-4 font-black text-[#6757ff] shadow-xl transition hover:-translate-y-1"
      >
        Get Started →
      </button>
    </section>
  );
}