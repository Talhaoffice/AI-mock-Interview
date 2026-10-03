import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { uploadResume } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";
  const candidateName = localStorage.getItem("candidateName") || "Candidate";

  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setResumeError("Please select a resume file (.pdf or .txt)");
      return;
    }

    setAnalyzing(true);
    setResumeError("");
    try {
      const data = await uploadResume(resumeFile);
      setResumeResult(data);
    } catch (err) {
      setResumeError("Failed to parse resume: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px" }}>
        {/* Header Hero */}
        <section
          className="glass-card"
          style={{
            padding: "40px",
            marginBottom: "32px",
            background: "linear-gradient(135deg, rgba(19, 27, 46, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="badge badge-emerald">System Ready</span>
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Logged in as: <strong>{role}</strong></span>
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: "800", letterSpacing: "-0.02em", color: "#f8fafc" }}>
                Welcome back, {candidateName}! 👋
              </h1>
              <p style={{ color: "#94a3b8", marginTop: "8px", maxWidth: "600px", fontSize: "1rem" }}>
                Take timed mock technical interviews, receive AI-driven feedback on every answer, and download professional performance reports.
              </p>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                style={{ fontSize: "1.05rem", padding: "14px 28px" }}
                onClick={() => navigate("/interview")}
              >
                🚀 Start Mock Interview
              </button>

              {role === "admin" && (
                <button
                  className="btn-secondary"
                  onClick={() => navigate("/admin")}
                >
                  ⚙️ Admin Question Bank
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Resume Skill Scanner Card */}
          <div className="glass-card" style={{ padding: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "1.8rem" }}>📄</span>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Resume Skill Scanner</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Upload your resume to extract skills</p>
              </div>
            </div>

            <form onSubmit={handleResumeUpload} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                style={{ padding: "10px", background: "rgba(0,0,0,0.2)" }}
              />

              {resumeError && (
                <p style={{ color: "#fb7185", fontSize: "0.85rem" }}>{resumeError}</p>
              )}

              <button
                type="submit"
                className="btn-secondary"
                disabled={analyzing}
                style={{ width: "100%" }}
              >
                {analyzing ? "Analyzing Resume..." : "🔍 Analyze Resume"}
              </button>
            </form>

            {resumeResult && (
              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(0,0,0,0.3)", borderRadius: "10px" }}>
                <p style={{ fontSize: "0.9rem", color: "#34d399", fontWeight: "600", marginBottom: "8px" }}>
                  ✅ Found {resumeResult.skills_count} Matching Skills:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {resumeResult.skills_found.map((s, idx) => (
                    <span key={idx} className="badge badge-cyan">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interview Features Card */}
          <div className="glass-card" style={{ padding: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "1.8rem" }}>⚡</span>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>How the Interview Works</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Structured for technical evaluation</p>
              </div>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", color: "#cbd5e1", fontSize: "0.9rem" }}>
              <li style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#06b6d4", fontWeight: "700" }}>01.</span>
                <span>Each question has a 30-second live countdown timer.</span>
              </li>
              <li style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#06b6d4", fontWeight: "700" }}>02.</span>
                <span>Type clear, comprehensive answers covering core concepts.</span>
              </li>
              <li style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#06b6d4", fontWeight: "700" }}>03.</span>
                <span>AI evaluates technical accuracy and generates feedback.</span>
              </li>
              <li style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#06b6d4", fontWeight: "700" }}>04.</span>
                <span>Download an interview report card with skill analytics.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
