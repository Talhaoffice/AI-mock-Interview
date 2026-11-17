import { useNavigate, Link, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || "Guest";

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? "#38bdf8" : "#94a3b8",
    textDecoration: "none",
    fontWeight: location.pathname === path ? "700" : "500",
    fontSize: "0.95rem",
    padding: "6px 12px",
    borderRadius: "8px",
    background: location.pathname === path ? "rgba(6, 182, 212, 0.1)" : "transparent",
    transition: "all 0.2s ease",
  });

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🤖</span>
          <span style={{ fontWeight: "800", fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#f8fafc" }}>
            AI Mock <span style={{ color: "#06b6d4" }}>Interview</span>
          </span>
        </Link>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/dashboard" style={navLinkStyle("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/interview" style={navLinkStyle("/interview")}>
            Interview
          </Link>
          {role === "admin" && (
            <Link to="/admin" style={navLinkStyle("/admin")}>
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span className={`badge ${role === "admin" ? "badge-purple" : "badge-cyan"}`}>
          Role: {role}
        </span>

        <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.85rem" }} onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
