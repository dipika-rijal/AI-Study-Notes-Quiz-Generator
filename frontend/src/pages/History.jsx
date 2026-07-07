import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function History() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  async function loadHistory(type = "all") {
    try {
      setLoading(true);
      setError("");

      const query = type === "all" ? "" : "?type=" + type;
      const response = await fetch("http://localhost:5000/api/history" + query);

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("History could not load. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  function handlePractice(item) {
    if (item.historyKind !== "saved-quiz") return;
    navigate("/app/quiz?savedQuizId=" + item.id);
  }

  function handleOpenNote(item) {
    if (item.type !== "note") return;
    navigate("/app/notes?savedNoteId=" + item.id);
  }

  function canManageItem(item) {
    return item.type === "note" || item.historyKind === "saved-quiz";
  }

  function getItemEndpoint(item) {
    if (item.type === "note") {
      return "http://localhost:5000/api/notes/" + item.id;
    }

    if (item.historyKind === "saved-quiz") {
      return "http://localhost:5000/api/quizzes/" + item.id;
    }

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
          : { topic: newTitle.trim() };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Rename failed");
      }

      await loadHistory(activeTab);
    } catch (err) {
      console.error(err);
      setError("Could not rename this item.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(item) {
    const endpoint = getItemEndpoint(item);
    if (!endpoint) return;

    const confirmed = window.confirm('Delete "' + item.title + '" from history?');
    if (!confirmed) return;

    try {
      setActionLoadingId(item.id);
      setError("");

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadHistory(activeTab);
    } catch (err) {
      console.error(err);
      setError("Could not delete this item.");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadHistory(activeTab);
  }, [activeTab]);

  const counts = data?.counts || {
    all: 0,
    notes: 0,
    quizzes: 0,
  };

  const items = data?.items || [];

  // Filter items based on active tab and search term (case-insensitive)
  const filteredItems = items.filter(item => {
    // Tab filter
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'notes' && item.type === 'note') ||
      (activeTab === 'quizzes' && (item.type === 'quiz' || item.historyKind === 'saved-quiz'));
    if (!matchesTab) return false;
    // Search filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || item.subtitle || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const topic = (item.topic || '').toLowerCase();
    return title.includes(term) || desc.includes(term) || category.includes(term) || content.includes(term) || topic.includes(term);
  });

  const primaryButton = {
    height: "42px",
    minWidth: "92px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "0",
    background: "#7c3cff",
    color: "white",
    fontWeight: "900",
    cursor: "pointer",
  };

  const orangeButton = {
    ...primaryButton,
    background: "#ff7a00",
  };

  const editButton = {
    height: "42px",
    minWidth: "70px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid #eadcff",
    background: "white",
    color: "#6d35ff",
    fontWeight: "900",
    cursor: "pointer",
  };

  const deleteButton = {
    height: "42px",
    minWidth: "78px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "0",
    background: "#fff1f2",
    color: "#be123c",
    fontWeight: "900",
    cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fffaf5", padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <Link
          to="/app"
          style={{
            display: "inline-block",
            marginBottom: "24px",
            padding: "10px 16px",
            background: "white",
            border: "1px solid #eadcff",
            borderRadius: "14px",
            color: "#6d35ff",
            fontWeight: "800",
            textDecoration: "none"
          }}
        >
          ← Back Home
        </Link>

        <h1 style={{ color: "#25145f", fontSize: "36px", marginBottom: "8px" }}>
          History
        </h1>

        <p style={{ color: "#9b8caf", fontWeight: "600", marginBottom: "24px" }}>
          Your saved notes, quizzes, and quiz attempts from MongoDB.
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            ["all", "All", counts.all],
            ["notes", "Notes", counts.notes],
            ["quizzes", "Quizzes", counts.quizzes],
          ].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "12px 22px",
                borderRadius: "16px",
                border: "1px solid #eadcff",
                background: activeTab === id ? "#7c3cff" : "white",
                color: activeTab === id ? "white" : "#4c367d",
                fontWeight: "900",
                cursor: "pointer"
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #eadcff",
              background: "#fafafa",
              fontSize: "16px",
            }}
          />
        </div>

        <div style={{ background: "white", border: "1px solid #eadcff", borderRadius: "28px", padding: "22px" }}>
          {loading && <p style={{ color: "#7c3cff", fontWeight: "800" }}>Loading history...</p>}

          {!loading && error && (
            <div style={{ background: "#fff1f2", padding: "16px", borderRadius: "18px", color: "#be123c", fontWeight: "800", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {!loading && (
            searchTerm && filteredItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 20px", color: "#9b8caf", fontWeight: "700" }}>
                <div style={{ fontSize: "42px", marginBottom: "16px" }}>🔎</div>
                <h2 style={{ color: "#25145f" }}>No matching history found.</h2>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (!searchTerm && items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 20px", color: "#9b8caf", fontWeight: "700" }}>
                <div style={{ fontSize: "42px", marginBottom: "16px" }}>🗂️</div>
                <h2 style={{ color: "#25145f" }}>No saved study materials yet.</h2>
                <p>Create a note or quiz and save it to see it here.</p>
              </div>
            ) : null)
          )}

          {!loading && filteredItems.length > 0 && (
            <div style={{ display: "grid", gap: "14px" }}>
              {filteredItems.map((item) => {
                const itemBusy = actionLoadingId === item.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #f0e5ff",
                      borderRadius: "20px",
                      padding: "18px",
                      background: "#fffdfb",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "18px",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          background: item.type === "note" ? "#f3e8ff" : "#ffedd5",
                          color: item.type === "note" ? "#7e22ce" : "#ea580c",
                          fontSize: "12px",
                          fontWeight: "900",
                          marginBottom: "10px"
                        }}
                      >
                        {item.type === "note"
                          ? "Note"
                          : item.historyKind === "quiz-attempt"
                            ? "Quiz Attempt"
                            : "Saved Quiz"}
                      </span>

                      <h3 style={{ color: "#25145f", margin: "0 0 7px", fontSize: "18px", fontWeight: "900" }}>
                        {item.title}
                      </h3>

                      <p style={{ color: "#9b8caf", margin: 0, fontWeight: "600", fontSize: "14px", lineHeight: "22px" }}>
                        {item.description || item.subtitle}
                      </p>

                      <p style={{ color: "#b5a8c8", marginTop: "8px", fontSize: "12px", fontWeight: "700" }}>
                        Saved on {new Date(item.createdAt || item.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", flexWrap: "nowrap" }}>
                      {item.type === "note" && (
                        <button
                          onClick={() => handleOpenNote(item)}
                          disabled={itemBusy}
                          style={{ ...primaryButton, opacity: itemBusy ? 0.6 : 1 }}
                        >
                          Open
                        </button>
                      )}

                      {item.type === "quiz" && item.historyKind === "saved-quiz" && (
                        <button
                          onClick={() => handlePractice(item)}
                          disabled={itemBusy}
                          style={{ ...orangeButton, opacity: itemBusy ? 0.6 : 1 }}
                        >
                          Practice
                        </button>
                      )}

                      {canManageItem(item) && (
                        <>
                          <button
                            onClick={() => handleRename(item)}
                            disabled={itemBusy}
                            style={{ ...editButton, opacity: itemBusy ? 0.6 : 1 }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            disabled={itemBusy}
                            style={{ ...deleteButton, opacity: itemBusy ? 0.6 : 1 }}
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {item.historyKind === "quiz-attempt" && (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "10px 16px",
                            borderRadius: "14px",
                            background: "#f3e8ff",
                            color: "#7e22ce",
                            fontWeight: "900",
                          }}
                        >
                          Attempt saved
                        </span>
                      )}
                    </div>
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
