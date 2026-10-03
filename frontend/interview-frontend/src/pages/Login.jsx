import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setError("");
    if (email === "admin@gmail.com") {
      localStorage.setItem("token", "admin-session-token");
      localStorage.setItem("role", "admin");
      localStorage.setItem("candidateName", "System Admin");
      navigate("/admin");
    } else {
      localStorage.setItem("token", "user-session-token");
      localStorage.setItem("role", "user");
      localStorage.setItem("candidateName", email.split("@")[0] || "Candidate");
      navigate("/dashboard");
    }
  };

  const continueGuest = () => {
    localStorage.setItem("token", "guest-session-token");
    localStorage.setItem("role", "user");
    localStorage.setItem("candidateName", "Guest Candidate");
    navigate("/dashboard");
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🤖</div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "8px" }}>
          AI Mock Interview
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "28px" }}>
          Sharpen your technical interview readiness with automated AI evaluations.
        </p>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "8px",
              color: "#fb7185",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600", marginBottom: "6px", display: "block" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="e.g. dev@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600", marginBottom: "6px", display: "block" }}>
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "8px" }}>
            Sign In to Practice
          </button>
        </form>

        <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>OR QUICK ACCESS</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}
            onClick={() => fillCredentials("admin@gmail.com", "admin123")}
          >
            Admin Demo
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}
            onClick={() => fillCredentials("talha@dev.com", "pass123")}
          >
            Candidate Demo
          </button>
        </div>

        <button
          type="button"
          onClick={continueGuest}
          style={{
            background: "transparent",
            border: "none",
            color: "#38bdf8",
            fontSize: "0.9rem",
            cursor: "pointer",
            fontWeight: "600",
            textDecoration: "underline",
          }}
        >
          Continue as Instant Guest &rarr;
        </button>
      </div>
    </div>
  );
}

export default Login;
