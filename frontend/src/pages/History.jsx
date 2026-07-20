import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QuizReview from "../components/app/QuizReview";

export default function History() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
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

  function handleOpenConversation(item) {
    navigate("/app?conversationId=" + item.id);
  }

  function canManageItem(item) {
    return (
      item.type === "note" ||
      item.historyKind === "saved-quiz" ||
      item.type === "conversation" ||
      item.historyKind === "quiz-attempt"
    );
  }

  function getItemEndpoint(item) {
    if (item.type === "note") return "http://localhost:5000/api/notes/" + item.id;
    if (item.historyKind === "saved-quiz") return "http://localhost:5000/api/quizzes/" + item.id;
    if (item.historyKind === "quiz-attempt") return "http://localhost:5000/api/quiz-attempts/" + item.id;
    if (item.type === "conversation") return "http://localhost:5000/api/conversations/" + item.id;
    return null;
  }

  async function handleRename(item) {
    const endpoint = getItemEndpoint(item);
    if (!endpoint) return;
    const newTitle = window.prompt("Rename this item:", item.title || "");
    if (!newTitle || !newTitle.trim()) return;
    try {
      setActionLoadingId(item.id);
      setError("");
      const payload =
        item.type === "note"
          ? { title: newTitle.trim() }
          : { title: newTitle.trim() };
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to rename");
      await loadHistory(activeTab);
      toast.success("Renamed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not rename this item.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(item) {
    const endpoint = getItemEndpoint(item);
    if (!endpoint) return;
    const confirmed = window.confirm(`Delete "${item.title || "this item"}"?`);
    if (!confirmed) return;
    try {
      setActionLoadingId(item.id);
      setError("");
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadHistory(activeTab);
      toast.success("Deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete this item.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadHistory(activeTab);
  }, [activeTab]);

  const counts = data?.counts || { all: 0, notes: 0, quizzes: 0 };
  const items = data?.items || [];

  const filteredItems = items.filter((item) => {
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
    const category = (item.category || "").toLowerCase();
    const content = (item.content || "").toLowerCase();
    const topic = (item.topic || "").toLowerCase();
    return (
      title.includes(term) ||
      desc.includes(term) ||
      category.includes(term) ||
      content.includes(term) ||
      topic.includes(term)
    );
  });

  const getBadgeStyle = (item) => {
    if (item.type === "note")
      return { background: "rgba(139,92,246,0.15)", color: "var(--theme-glow-purple)" };
    if (item.type === "conversation")
      return { background: "rgba(6,182,212,0.15)", color: "var(--theme-glow-cyan)" };
    return { background: "rgba(245,158,11,0.15)", color: "var(--theme-glow-orange)" };
  };

  const getBadgeLabel = (item) => {
    if (item.type === "note") return "Note";
    if (item.type === "conversation") return "Chat";
    if (item.historyKind === "quiz-attempt") return "Quiz Attempt";
    return "Saved Quiz";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--theme-bg-primary)",
        color: "var(--theme-text-primary)",
        padding: "40px 32px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        {/* Back Link */}
        <Link
          to="/app"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "28px",
            padding: "10px 18px",
            background: "var(--theme-surface)",
            border: "1px solid var(--theme-glass-border)",
            borderRadius: "14px",
            color: "var(--theme-glow-purple)",
            fontWeight: "700",
            textDecoration: "none",
            fontSize: "14px",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
          }}
        >
          ← Back Home
        </Link>

        {/* Page Title */}
        <h1
          style={{
            color: "var(--theme-text-primary)",
            fontSize: "36px",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            marginBottom: "6px",
          }}
        >
          History
        </h1>
        <p
          style={{
            color: "var(--theme-text-secondary)",
            fontWeight: "600",
            marginBottom: "28px",
            fontSize: "14px",
          }}
        >
          Your saved notes, quizzes, and quiz attempts.
        </p>

        {/* Tab Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            ["all", "All", counts.all],
            ["notes", "Notes", counts.notes],
            ["quizzes", "Quizzes", counts.quizzes],
            ["conversations", "Conversations", counts.conversations || 0],
          ].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "10px 20px",
                borderRadius: "14px",
                border: `1px solid ${activeTab === id ? "var(--theme-glow-purple)" : "var(--theme-glass-border)"}`,
                background:
                  activeTab === id
                    ? "var(--theme-glow-purple)"
                    : "var(--theme-surface)",
                color: activeTab === id ? "#ffffff" : "var(--theme-text-secondary)",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
              }}
            >
              {label}{" "}
              <span
                style={{
                  opacity: 0.7,
                  fontSize: "12px",
                }}
              >
                ({count})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "14px",
              border: "1px solid var(--theme-glass-border)",
              background: "var(--theme-surface)",
              color: "var(--theme-text-primary)",
              fontSize: "14px",
              fontWeight: "500",
              outline: "none",
              backdropFilter: "blur(12px)",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--theme-glow-purple)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--theme-glass-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Content Area */}
        <div
          style={{
            background: "var(--theme-surface)",
            border: "1px solid var(--theme-glass-border)",
            borderRadius: "24px",
            padding: "20px",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Loading */}
          {loading && (
            <p style={{ color: "var(--theme-glow-purple)", fontWeight: "800", padding: "20px 0" }}>
              Loading history...
            </p>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                padding: "16px",
                borderRadius: "14px",
                color: "#ef4444",
                fontWeight: "700",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Empty States */}
          {!loading && !error && (
            <>
              {searchTerm && filteredItems.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "70px 20px",
                    color: "var(--theme-text-muted)",
                    fontWeight: "600",
                  }}
                >
                  <div style={{ fontSize: "42px", marginBottom: "16px" }}>🔎</div>
                  <h2 style={{ color: "var(--theme-text-primary)", fontWeight: "900" }}>
                    No matching history found.
                  </h2>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
              {!searchTerm && items.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "70px 20px",
                    color: "var(--theme-text-muted)",
                    fontWeight: "600",
                  }}
                >
                  <div style={{ fontSize: "42px", marginBottom: "16px" }}>🗂️</div>
                  <h2 style={{ color: "var(--theme-text-primary)", fontWeight: "900" }}>
                    No saved study materials yet.
                  </h2>
                  <p>Create a note or quiz and save it to see it here.</p>
                </div>
              )}
            </>
          )}

          {/* Item List */}
          {!loading && filteredItems.length > 0 && (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredItems.map((item) => {
                const itemBusy = actionLoadingId === item.id;

                return (
                  <div key={item.id}>
                    <div
                      onClick={() => {
                        if (item.type === "note") {
                          navigate("/app/notes?savedNoteId=" + item.id);
                        } else if (item.historyKind === "saved-quiz") {
                          navigate("/app/quiz?savedQuizId=" + item.id);
                        } else if (item.historyKind === "quiz-attempt") {
                          setExpandedAttemptId(
                            expandedAttemptId === item.id ? null : item.id
                          );
                        } else {
                          handleOpenConversation(item);
                        }
                      }}
                      style={{
                        border: "1px solid var(--theme-glass-border)",
                        borderRadius: "18px",
                        padding: "18px",
                        background: "var(--theme-bg-secondary)",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "16px",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(139,92,246,0.12)";
                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "var(--theme-glass-border)";
                      }}
                    >
                      {/* Left: Info */}
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: "800",
                            marginBottom: "10px",
                            letterSpacing: "0.03em",
                            ...getBadgeStyle(item),
                          }}
                        >
                          {getBadgeLabel(item)}
                        </span>

                        <h3
                          style={{
                            color: "var(--theme-text-primary)",
                            margin: "0 0 6px",
                            fontSize: "16px",
                            fontWeight: "800",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.title}
                        </h3>

                        <p
                          style={{
                            color: "var(--theme-text-secondary)",
                            margin: 0,
                            fontWeight: "500",
                            fontSize: "13px",
                            lineHeight: "1.5",
                          }}
                        >
                          {item.description || item.subtitle}
                        </p>

                        <p
                          style={{
                            color: "var(--theme-text-muted)",
                            marginTop: "8px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          Saved on{" "}
                          {new Date(
                            item.createdAt || item.updatedAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "nowrap",
                        }}
                      >
                        {canManageItem(item) && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(item);
                              }}
                              disabled={itemBusy}
                              style={{
                                height: "36px",
                                padding: "0 14px",
                                borderRadius: "10px",
                                border: "1px solid var(--theme-glass-border)",
                                background: "var(--theme-surface)",
                                color: "var(--theme-glow-purple)",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontSize: "13px",
                                opacity: itemBusy ? 0.5 : 1,
                                transition: "all 0.2s ease",
                              }}
                            >
                              Rename
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                              disabled={itemBusy}
                              style={{
                                height: "36px",
                                padding: "0 14px",
                                borderRadius: "10px",
                                border: "none",
                                background: "rgba(239,68,68,0.12)",
                                color: "#ef4444",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontSize: "13px",
                                opacity: itemBusy ? 0.5 : 1,
                                transition: "all 0.2s ease",
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {item.historyKind === "quiz-attempt" && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              background:
                                item.status === "in_progress"
                                  ? "rgba(245,158,11,0.15)"
                                  : "rgba(139,92,246,0.15)",
                              color:
                                item.status === "in_progress"
                                  ? "var(--theme-glow-orange)"
                                  : "var(--theme-glow-purple)",
                              fontWeight: "800",
                              fontSize: "12px",
                            }}
                          >
                            {item.status === "in_progress"
                              ? "In Progress"
                              : "Attempt saved"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Quiz Attempt */}
                    {item.historyKind === "quiz-attempt" &&
                      expandedAttemptId === item.id && (
                        <div
                          style={{ padding: "0 4px 4px", marginTop: "-8px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.results &&
                          Array.isArray(item.results) &&
                          item.results.length > 0 ? (
                            <QuizReview
                              quiz={{ questions: item.results }}
                              answers={item.results}
                              score={parseInt(item.scoreText.split("/")[0])}
                              totalQuestions={item.questionCount}
                              attemptId={item.id}
                              isSaved={true}
                              onUnsave={async () => {
                                try {
                                  const res = await fetch(
                                    `http://localhost:5000/api/quiz-attempts/${item.id}`,
                                    { method: "DELETE" }
                                  );
                                  if (res.ok) {
                                    setExpandedAttemptId(null);
                                    setData((prev) => ({
                                      ...prev,
                                      items: prev.items.filter(
                                        (i) => i.id !== item.id
                                      ),
                                    }));
                                    toast.success("Attempt removed from history");
                                  } else {
                                    toast.error("Could not remove attempt");
                                  }
                                } catch {
                                  toast.error("Could not remove attempt");
                                }
                              }}
                              onRetry={() => {
                                if (
                                  !item.quizId ||
                                  item.quizId === "undefined"
                                ) {
                                  toast.error(
                                    "This attempt is missing its quiz reference."
                                  );
                                  return;
                                }
                                navigate(
                                  `/app/quiz?savedQuizId=${item.quizId}`
                                );
                              }}
                              onClose={() => setExpandedAttemptId(null)}
                            />
                          ) : (
                            <div
                              style={{
                                borderRadius: "16px",
                                border: "1px solid var(--theme-glass-border)",
                                background: "var(--theme-bg-secondary)",
                                padding: "24px",
                                textAlign: "center",
                                marginTop: "4px",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "var(--theme-text-muted)",
                                  marginBottom: "16px",
                                }}
                              >
                                No detailed review available for this legacy
                                attempt.
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: "12px",
                                }}
                              >
                                <button
                                  onClick={() => {
                                    if (
                                      !item.quizId ||
                                      item.quizId === "undefined"
                                    ) {
                                      toast.error(
                                        "This attempt is missing its quiz reference."
                                      );
                                      return;
                                    }
                                    navigate(
                                      `/app/quiz?savedQuizId=${item.quizId}`
                                    );
                                  }}
                                  style={{
                                    padding: "10px 20px",
                                    borderRadius: "12px",
                                    border: "none",
                                    background:
                                      "linear-gradient(135deg, var(--theme-glow-orange), var(--theme-glow-pink))",
                                    color: "white",
                                    fontWeight: "800",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                  }}
                                >
                                  Retry Quiz
                                </button>
                                <button
                                  onClick={() => setExpandedAttemptId(null)}
                                  style={{
                                    padding: "10px 20px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--theme-glass-border)",
                                    background: "var(--theme-surface)",
                                    color: "var(--theme-text-secondary)",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                  }}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
