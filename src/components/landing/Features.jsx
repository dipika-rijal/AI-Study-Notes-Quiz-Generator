export default function Features() {
  const cards = [
    {
      icon: "▤",
      title: "Clean Notes",
      text: "Turn rough content into organized, readable notes.",
      style: "from-white to-[#f1edff]",
      iconStyle: "bg-[#eeeaff] text-[#6757ff]",
    },
    {
      icon: "◎",
      title: "Quick Quiz",
      text: "Practice with questions from your own material.",
      style: "from-white to-[#fff1e6]",
      iconStyle: "bg-[#fff0d0] text-orange-500",
    },
    {
      icon: "▶",
      title: "Video Friendly",
      text: "Start from a video link or pasted content.",
      style: "from-white to-[#edfff6]",
      iconStyle: "bg-[#d9f7e8] text-emerald-600",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20 text-center">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#6757ff]">
        What you get
      </p>

      <h2 className="text-4xl font-black tracking-[-0.05em] text-[#15132b] md:text-5xl">
        Three tools, one simple goal
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-[#77718f]">
        A soft, simple way to turn study material into revision content without
        feeling overwhelmed.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-[28px] border border-purple-100 bg-gradient-to-br ${card.style} p-8 text-left shadow-xl shadow-purple-100 transition hover:-translate-y-2`}
          >
            <div
              className={`mb-8 grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg ${card.iconStyle}`}
            >
              {card.icon}
            </div>

            <h3 className="mb-3 text-xl font-black tracking-tight text-[#15132b]">
              {card.title}
            </h3>

            <p className="leading-7 text-[#77718f]">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
