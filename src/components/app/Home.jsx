import { Link } from "react-router-dom";

export default function Home({ user }) {
  const displayName =
    user.displayName || user.email?.split("@")[0] || "Student";

  const stats = [
    {
      label: "Notes Created",
      value: 0,
      icon: "▤",
      color: "bg-[#eeeaff] text-[#6757ff]",
    },
    {
      label: "Quizzes Created",
      value: 0,
      icon: "◎",
      color: "bg-[#fff0d0] text-orange-500",
    },
    {
      label: "Study Sessions",
      value: 0,
      icon: "◴",
      color: "bg-[#d9f7e8] text-emerald-600",
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_85%_20%,rgba(255,216,182,0.26),transparent_26%),linear-gradient(135deg,#6757ff,#9b4dff)] px-8 py-10 text-white shadow-2xl shadow-purple-200">
        <div className="relative z-10">
          <p className="mb-3 text-sm font-black text-white/80">✦ StudyGen AI</p>

          <h1 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">
            Welcome back,{" "}
            <span className="text-yellow-200">{displayName}!</span>
          </h1>

          <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-white/80">
            What would you like to create today? Choose notes or quiz and start
            your study session.
          </p>
        </div>

        <div className="absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-3xl bg-white/15 text-2xl backdrop-blur">
          📚
        </div>

        <div className="absolute bottom-8 right-16 grid h-12 w-12 place-items-center rounded-3xl bg-white/15 text-xl backdrop-blur">
          ✨
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-purple-100 bg-white/85 p-6 shadow-lg shadow-purple-100/60"
          >
            <div className="flex items-center gap-4">
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl text-xl ${stat.color}`}
              >
                {stat.icon}
              </div>

              <div>
                <p className="text-2xl font-black text-[#15132b]">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[#9a93b3]">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[32px] border border-purple-100 bg-white/85 p-7 shadow-xl shadow-purple-100/70">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#eeeaff] text-2xl text-[#6757ff]">
            ▤
          </div>

          <h2 className="text-2xl font-black text-[#15132b]">Create Notes</h2>

          <p className="mt-3 leading-7 text-[#8a83a5]">
            Turn a topic, pasted content, or video link into clean study notes.
          </p>

          <Link
            to="/app/notes?type=topic"
            className="mt-7 block w-full rounded-2xl bg-gradient-to-r from-[#6757ff] to-[#b75cff] px-5 py-4 text-center font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5"
          >
            Create Notes →
          </Link>
        </div>

        <div className="rounded-[32px] border border-orange-100 bg-white/85 p-7 shadow-xl shadow-orange-100/70">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0d0] text-2xl text-orange-500">
            ◎
          </div>

          <h2 className="text-2xl font-black text-[#15132b]">Create Quiz</h2>

          <p className="mt-3 leading-7 text-[#8a83a5]">
            Generate simple practice questions from your own study material.
          </p>

          <Link
            to="/app/quiz?type=topic"
            className="mt-7 block w-full rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-5 py-4 text-center font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5"
          >
            Create Quiz →
          </Link>
        </div>
      </section>
    </div>
  );
}
