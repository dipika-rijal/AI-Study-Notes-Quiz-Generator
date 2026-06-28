export default function Footer() {
  return (
    <footer className="bg-[#111025] px-5 py-9 text-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#6757ff] to-[#9a7cff]">
            ✦
          </div>

          <div>
            <p className="font-black">StudyGen AI</p>
            <p className="text-sm font-semibold text-white/50">
              Built for students.
            </p>
          </div>
        </div>

        <div className="flex gap-8 text-sm font-bold text-white/55">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}