import { useNavigate } from "react-router-dom";
import { Modal, Card, Badge } from "../../design-system";

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
    <Modal
      isOpen={!!modalType}
      onClose={closeModal}
      size="xl"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <h2 className="text-center text-3xl font-black tracking-[-0.05em] text-[#15132b] md:text-5xl">
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
          <Card
            key={card.title}
            onClick={() => handleCardClick(card.type)}
            variant="elevated"
            hover={true}
            padding="lg"
            style={{ cursor: 'pointer', textAlign: 'center' }}
          >
            <div className="mb-4 text-4xl">{card.icon}</div>

            <h3 className="mb-2 text-lg font-black text-[#15132b]">
              {card.title}
            </h3>

            <p className="text-sm leading-6 text-[#77718f]">{card.text}</p>
          </Card>
        ))}
      </div>

      {!user && (
        <Badge variant="primary" size="md" className="mt-6" style={{ display: 'block', textAlign: 'center', padding: '12px 16px' }}>
          Login is required because your generated notes and quizzes will belong to your account.
        </Badge>
      )}
    </Modal>
  );
}
