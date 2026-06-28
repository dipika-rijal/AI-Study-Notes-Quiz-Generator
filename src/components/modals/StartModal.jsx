export default function StartModal({ modalType, closeModal }) {
  if (!modalType) return null;

  const isQuiz = modalType === "quiz";

  const cards = isQuiz
    ? [
        {
          icon: "💭",
          title: "Write a topic",
          text: "Create quiz questions from a topic.",
        },
        {
          icon: "📝",
          title: "Paste study content",
          text: "Generate quiz from notes or paragraphs.",
        },
        {
          icon: "🎬",
          title: "Paste video link",
          text: "Create quiz from a video link later.",
        },
      ]
    : [
        {
          icon: "⌨️",
          title: "Write a prompt",
          text: "Describe what your notes should be about.",
        },
        {
          icon: "📄",
          title: "Upload or paste content",
          text: "Add your existing notes or study material.",
        },
        {
          icon: "🎥",
          title: "Choose a video",
          text: "Paste a YouTube video link to create notes later.",
        },
      ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15132b]/30 px-5 backdrop-blur-xl"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-4xl rounded-[34px] border border-purple-100 bg-white/95 p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#f3f0f9] text-xl font-black text-[#7c7497]"
        >
          ×
        </button>

        <h2 className="mt-4 text-center text-3xl font-black tracking-[-0.05em] text-[#15132b] md:text-5xl">
          {isQuiz
            ? "How would you like to create your quiz?"
            : "How would you like to create your note?"}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-center leading-7 text-[#77718f]">
          {isQuiz
            ? "Start with a topic, pasted content, or a video link. The real quiz flow will be added later."
            : "Choose the easiest way to start. The real generator will be added later in React."}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.title}
              className="rounded-3xl border border-purple-100 bg-white/80 p-7 text-center transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">{card.icon}</div>

              <h3 className="mb-2 text-lg font-black text-[#15132b]">
                {card.title}
              </h3>

              <p className="text-sm leading-6 text-[#77718f]">{card.text}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}