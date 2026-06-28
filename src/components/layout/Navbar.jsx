export default function Navbar({ openModal, openAuthModal, user, logout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-purple-100/70 bg-[#fffaf3]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-3 font-extrabold tracking-tight text-[#15132b]">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6757ff] to-[#9a7cff] text-white shadow-lg shadow-purple-300">
            ✦
          </div>

          <span className="text-xl">
            StudyGen <span className="text-[#6757ff]">AI</span>
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-bold text-[#77718f] md:flex">
          <a href="#features" className="hover:text-[#6757ff]">
            Features
          </a>
          <a href="#process" className="hover:text-[#6757ff]">
            How It Works
          </a>
          <a href="#about" className="hover:text-[#6757ff]">
            About
          </a>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-[#77718f] sm:block">
                {user.displayName || user.email}
              </span>

              <button
                onClick={logout}
                className="rounded-full border border-purple-100 bg-white/80 px-5 py-3 text-[#6757ff] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Logout
              </button>

              <button
                onClick={() => openModal("notes")}
                className="rounded-full bg-gradient-to-r from-[#6757ff] to-[#8b5cf6] px-5 py-3 text-white shadow-lg shadow-purple-300 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Make Notes →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("login")}
                className="hidden text-[#77718f] hover:text-[#6757ff] sm:block"
              >
                Sign in
              </button>

              <button
                onClick={() => openAuthModal("signup")}
                className="rounded-full bg-gradient-to-r from-[#6757ff] to-[#8b5cf6] px-5 py-3 text-white shadow-lg shadow-purple-300 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get Started →
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}