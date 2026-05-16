// src/pages/Sidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";

const NAV = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "◱", label: "Feed", path: "/feed" },
  { icon: "✦", label: "Match", path: "/match" },
  { icon: "◯", label: "Profile", path: "/profile" },
  { icon: "✉", label: "Messages", path: "/messages" },
  { icon: "🔔", label: "Notifications", path: "/notifications" },
  { icon: "⚙", label: "Settings", path: "/settings" },
];

export default function Sidebar({ role = "student", user = {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isStudent = role === "student";
  const activeColor = isStudent ? "#C1623F" : "#1E3A5F";

  function handleLogout() {
    // 🔁 Add Firebase signOut here later
    navigate("/");
  }

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #e8e2d9",
      display: "flex",
      flexDirection: "column",
      padding: "28px 16px",
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          border: `2px solid ${activeColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: activeColor }}>C</span>
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: activeColor }}>Conecta</span>
      </div>

      {/* User */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: 12, background: "#f0ebe3", borderRadius: 14, marginBottom: 28,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: activeColor + "22",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
        }}>
          {isStudent ? "🎓" : "📘"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.name || "Guest User"}
          </p>
          <p style={{ fontSize: 11, color: "#9999aa" }}>{isStudent ? "Student" : "Teacher"}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/dashboard" && (location.pathname === "/dashboard/student" || location.pathname === "/dashboard/teacher"));
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path, { state: { role } })}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 10, border: "none",
                background: isActive ? activeColor : "transparent",
                color: isActive ? "#fff" : "#6b6b7b",
                fontSize: 14, fontWeight: isActive ? 600 : 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all 0.18s ease",
              }}
            >
              <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px", background: "none", border: "none",
          color: "#9999aa", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer", borderRadius: 10, marginTop: 12,
          transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#e05252"}
        onMouseLeave={e => e.currentTarget.style.color = "#9999aa"}
      >
        <span>→</span> Logout
      </button>
    </aside>
  );
}
