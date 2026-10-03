import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from "../services/api";

function Admin() {
  const [question, setQuestion] = useState("");
  const [skill, setSkill] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (err) {
      setError("Failed to fetch questions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const saveQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || !skill.trim()) {
      setError("Both question text and skill category are required.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      if (editId) {
        await updateQuestion(editId, { question, skill });
        setSuccess("Question updated successfully!");
        setEditId(null);
      } else {
        await createQuestion({ question, skill });
        setSuccess("New question added to interview bank!");
      }
      setQuestion("");
      setSkill("");
      loadQuestions();
    } catch (err) {
      setError("Operation failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      setSuccess("Question removed from bank.");
      loadQuestions();
    } catch (err) {
      setError("Failed to delete question: " + err.message);
    }
  };

  const handleEdit = (q) => {
    setEditId(q.id);
    setQuestion(q.question);
    setSkill(q.skill);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setQuestion("");
    setSkill("");
  };

  // Filter questions
  const skillsList = Array.from(new Set(questions.map((q) => q.skill))).filter(Boolean);
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = selectedSkill === "all" || q.skill.toLowerCase() === selectedSkill.toLowerCase();
    return matchesSearch && matchesSkill;
  });

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Admin Question Management</h1>
            <p style={{ color: "#94a3b8" }}>Create, update, and manage technical interview prompts</p>
          </div>
          <span className="badge badge-purple">{questions.length} Questions in Bank</span>
        </div>

        {/* Feedback messages */}
        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "8px", color: "#fb7185", marginBottom: "20px" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", color: "#34d399", marginBottom: "20px" }}>
            {success}
          </div>
        )}

        {/* Add / Edit Form */}
        <div className="glass-card" style={{ padding: "30px", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>
            {editId ? "✏️ Edit Question" : "➕ Add New Interview Question"}
          </h2>

          <form onSubmit={saveQuestion} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                INTERVIEW QUESTION PROMPT
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Explain how React reconciliation and the Virtual DOM operate."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  PRIMARY SKILL / DOMAIN
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, JavaScript, PHP, Laravel, SQL"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {editId && (
                  <button type="button" className="btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editId ? "Update Question" : "Add to Question Bank"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Question Bank Explorer */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Active Question Bank</h2>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "220px", padding: "8px 12px", fontSize: "0.85rem" }}
              />

              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                style={{ width: "160px", padding: "8px 12px", fontSize: "0.85rem" }}
              >
                <option value="all">All Skills</option>
                {skillsList.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "30px" }}>Refreshing question bank...</p>
          ) : filteredQuestions.length === 0 ? (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8" }}>No matching questions found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="glass-card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "6px" }}>
                      <span className="badge badge-cyan">{q.skill}</span>
                    </div>
                    <p style={{ fontSize: "1rem", color: "#f8fafc", lineHeight: "1.4" }}>{q.question}</p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.85rem" }} onClick={() => handleEdit(q)}>
                      Edit
                    </button>
                    <button className="btn-danger" style={{ padding: "6px 14px", fontSize: "0.85rem" }} onClick={() => handleDelete(q.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Admin;
