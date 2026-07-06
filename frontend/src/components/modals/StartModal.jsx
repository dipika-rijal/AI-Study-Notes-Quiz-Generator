import { useNavigate } from "react-router-dom";

export default function StartModal({
  modalType,
  user,
  closeModal,
  openAuthModal,
}) {
  const navigate = useNavigate();

  if (!modalType) return null;

  const isQuiz = modalType === "quiz";

  const cards = isQuiz
    ? [
        {
          icon: "💭",
          title: "Write a topic",
          text: "Create quiz questions from a small topic.",
          type: "topic",
        },
        {
          icon: "📄",
          title: "Upload or paste content",
          text: "Create quiz from your notes or study material.",
          type: "content",
        },
      ]
    : [
        {
          icon: "⌨️",
          title: "Write a topic",
          text: "Create notes from a small topic.",
          type: "topic",
        },
        {
          icon: "📄",
          title: "Upload or paste content",
          text: "Create notes from your own study material.",
          type: "content",
        },
        {
          icon: "🎥",
          title: "Paste video link",
          text: "Create notes from a video link and topic details.",
          type: "video",
        },
      ];

  function handleCardClick(cardType) {
    closeModal();

    if (!user) {
      openAuthModal("signup");
      return;
    }

    if (isQuiz) {
      navigate(`/app/quiz?type=${cardType}`);
      return;
    }

    navigate(`/app/notes?type=${cardType}`);
  }

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
          {user
            ? "Choose a starting method and continue inside your StudyGen workspace."
            : "Login or create an account first, then continue to the generator workspace."}
        </p>

        <div
          className={`mt-8 grid grid-cols-1 gap-4 ${
            isQuiz ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
        >
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => handleCardClick(card.type)}
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

        {!user && (
          <p className="mt-6 rounded-2xl bg-[#eeeaff] px-4 py-3 text-center text-sm font-bold text-[#6757ff]">
            Login is required because your generated notes and quizzes will
            belong to your account.
          </p>
        )}
      </div>
    </div>
  );
}
