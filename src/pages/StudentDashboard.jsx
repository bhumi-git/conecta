// src/pages/StudentDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const STUDENT_NAV = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "◱", label: "Feed", path: "/feed" },
  { icon: "✦", label: "Match", path: "/match" },
  { icon: "◯", label: "Profile", path: "/profile" },
];

const recentActivity = [
  { avatar: "👩‍🏫", name: "Dr. Sarah Chen", action: "matched with you for Machine Learning guidance", time: "2 hours ago" },
  { avatar: "👨‍💻", name: "Alex Kumar", action: "invited you to join AI Hackathon project", time: "5 hours ago" },
  { avatar: "👨‍🎓", name: "Prof. Michael Brown", action: "replied to your doubt on Data Structures", time: "1 day ago" },
];

const upcomingEvents = [
  { tag: "Workshop", tagColor: "#C1623F", title: "Web Development Workshop", date: "Apr 16, 2026 • 2:00 PM", accent: "#C1623F" },
  { tag: "Deadline", tagColor: "#E05252", title: "Hackathon Registration Deadline", date: "Apr 18, 2026 • 11:59 PM", accent: "#E05252" },
  { tag: "Meeting", tagColor: "#4A6FA5", title: "1-on-1 Mentorship Session", date: "Apr 20, 2026 • 4:00 PM", accent: "#4A6FA5" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Dashboard");

  // 🔁 Replace with real user data from Firebase later
  const user = {
    name: "Guest User",
    role: "Student",
    avatar: "🎓",
  };

  function handleLogout() {
    // 🔁 Add Firebase signOut here later
    navigate("/");
  }

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar sidebar--student">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="brand-logo-inner">C</span>
          </div>
          <span className="brand-name">Conecta</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar user-avatar--student">{user.avatar}</div>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.role}</p>
          </div>
          <button className="notif-btn">🔔</button>
        </div>

        <nav className="sidebar-nav">
          {STUDENT_NAV.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "nav-item--active nav-item--active-student" : ""}`}
              onClick={() => {
                setActiveNav(item.label);
                // navigate(item.path); // uncomment when routes are ready
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span>→</span> Logout
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main">
        <div className="dashboard-content">

          {/* Header */}
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Welcome!</h1>
              <p className="dash-subtitle">Here's what's happening in your academic network</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: "👥", value: "12", label: "Connections" },
              { icon: "📖", value: "3", label: "Projects" },
              { icon: "💬", value: "8", label: "Messages" },
              { icon: "🏅", value: "5", label: "Achievements" },
            ].map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div className="bottom-grid">
            {/* Recent Activity */}
            <div className="panel">
              <h2 className="panel-title">Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.map((item, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-avatar">{item.avatar}</div>
                    <div className="activity-text">
                      <p>
                        <strong>{item.name}</strong> {item.action}
                      </p>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-btn view-all-btn--student">View All Activity →</button>
            </div>

            {/* Upcoming */}
            <div className="panel">
              <h2 className="panel-title">📅 Upcoming</h2>
              <div className="events-list">
                {upcomingEvents.map((ev, i) => (
                  <div className="event-card" key={i} style={{ borderLeftColor: ev.accent }}>
                    <span className="event-tag" style={{ color: ev.tagColor, background: ev.tagColor + "18" }}>
                      {ev.tag}
                    </span>
                    <p className="event-title">{ev.title}</p>
                    <p className="event-date">{ev.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
