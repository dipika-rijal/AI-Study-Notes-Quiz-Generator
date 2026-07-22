import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StudySessionCard from "../components/app/StudySessionCard";
import QuizReview from "../components/app/QuizReview";

export default function History() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);

  const navigate = useNavigate();

  async function loadHistory(type = "all") {
    try {
      setLoading(true);
      setError("");
      const query = type === "all" ? "" : "?type=" + type;
      const response = await fetch("http://localhost:5000/api/history" + query);
      if (!response.ok) throw new Error("Failed to fetch history");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("History could not load. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory(activeTab);
  }, [activeTab]);

  const counts = data?.counts || { all: 0, notes: 0, quizzes: 0 };
  const items = data?.items || [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "notes" && item.type === "note") ||
        (activeTab === "quizzes" &&
          (item.type === "quiz" || item.historyKind === "saved-quiz")) ||
        (activeTab === "conversations" && item.type === "conversation");
      if (!matchesTab) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const title = (item.title || "").toLowerCase();
      const desc = (item.description || item.subtitle || "").toLowerCase();
      return title.includes(term) || desc.includes(term);
    });
  }, [items, activeTab, searchTerm]);

  const getLinkForItem = (item) => {
    if (item.type === "note") return "/app/notes?savedNoteId=" + item.id;
    if (item.historyKind === "saved-quiz") return "/app/quiz?savedQuizId=" + item.id;
    if (item.type === "conversation") return "/app?conversationId=" + item.id;
    return "#";
  };

  const getStatus = (item) => {
    if (item.historyKind === "quiz-attempt") {
      return item.status === "in_progress" ? "In progress" : "Completed";
    }
    return "Completed"; 
  };

  const getTypeLabel = (item) => {
    if (item.type === "note") return "Notes";
    if (item.type === "conversation") return "Discussion";
    if (item.historyKind === "quiz-attempt") return "Quiz Attempt";
    return "Quiz";
  };

  const getProgress = (item) => {
    if (item.historyKind === "quiz-attempt" && item.scoreText) {
      return item.scoreText;
    }
    return "100%";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 pt-4 px-4 sm:px-0">
      {/* Header */}
      <header className="space-y-3">
        <Link 
          to="/app" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
        >
          ← Back Home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--theme-text-primary)]">
          Learning Memory
        </h1>
        <p className="text-lg text-[var(--theme-text-secondary)]">
          Review your past study sessions and materials.
        </p>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All", counts.all],
            ["notes", "Notes", counts.notes],
            ["quizzes", "Quizzes", counts.quizzes],
            ["conversations", "Discussions", counts.conversations || 0],
          ].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === id 
                  ? 'bg-[var(--theme-text-primary)] text-[var(--theme-bg-primary)] shadow-sm' 
                  : 'bg-[var(--theme-bg-secondary)] border border-[var(--theme-glass-border)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]'
              }`}
            >
              {label} <span className="opacity-60 ml-1">({count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search memory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading && (
          <div className="flex justify-center py-20">
            <span className="text-[var(--theme-text-muted)] font-medium">Loading memory...</span>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-text)] text-sm font-medium">
            {error}
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="text-4xl">🗂️</div>
            <h3 className="text-xl font-medium text-[var(--theme-text-primary)]">No sessions found</h3>
            <p className="text-[var(--theme-text-secondary)]">
              {searchTerm ? 'Try adjusting your search terms.' : 'Create some notes or quizzes to build your memory.'}
            </p>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.historyKind === "quiz-attempt" && expandedAttemptId === item.id ? (
                  <div className="p-6 rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] shadow-sm">
                    {item.results && item.results.length > 0 ? (
                      <QuizReview
                        quiz={{ questions: item.results }}
                        answers={item.results}
                        score={parseInt(item.scoreText.split("/")[0])}
                        totalQuestions={item.questionCount}
                        attemptId={item.id}
                        isSaved={true}
                        onUnsave={() => setExpandedAttemptId(null)}
                        onRetry={() => {
                          if (item.quizId) navigate(`/app/quiz?savedQuizId=${item.quizId}`);
                        }}
                        onClose={() => setExpandedAttemptId(null)}
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <p className="text-[var(--theme-text-secondary)]">No detailed review available.</p>
                        <button 
                          onClick={() => setExpandedAttemptId(null)}
                          className="px-4 py-2 rounded-lg bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-primary)] text-sm"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      if (item.historyKind === "quiz-attempt") {
                        setExpandedAttemptId(expandedAttemptId === item.id ? null : item.id);
                      } else {
                        navigate(getLinkForItem(item));
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <StudySessionCard 
                      topic={item.title || "Untitled Session"}
                      type={getTypeLabel(item)}
                      progress={getProgress(item)}
                      date={new Date(item.createdAt || item.updatedAt).toLocaleDateString()}
                      status={getStatus(item)}
                      link={item.historyKind === "quiz-attempt" ? "#" : getLinkForItem(item)}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
