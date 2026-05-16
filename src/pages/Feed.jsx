// src/pages/Feed.jsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Feed.css";

const FILTERS = ["All", "Announcements", "Projects", "Doubts", "Achievements"];

const DUMMY_POSTS = [
  {
    id: 1, author: "Dr. Sarah Chen", role: "Teacher", avatar: "👩‍🏫",
    avatarBg: "#1E3A5F", time: "2 hours ago", type: "Announcement",
    content: "Excited to announce a new Machine Learning workshop next week! We'll be covering neural networks, deep learning fundamentals, and hands-on projects. Open to all students interested in AI.",
    tags: ["#Machine Learning", "#Workshop", "#AI"], likes: 24, comments: 8,
  },
  {
    id: 2, author: "Alex Kumar", role: "Student", avatar: "🎓",
    avatarBg: "#C1623F", time: "5 hours ago", type: "Project",
    content: "Looking for teammates for the upcoming hackathon! Need 2 more members with skills in React and Node.js. We're building an AI-powered study companion app. DM if interested!",
    tags: ["#Hackathon", "#React", "#Node.js", "#AI"], likes: 15, comments: 12,
  },
  {
    id: 3, author: "Priya Sharma", role: "Student", avatar: "👩‍💻",
    avatarBg: "#C1623F", time: "1 day ago", type: "Doubt",
    content: "Can anyone help me understand the difference between supervised and unsupervised learning? I'm preparing for my ML exam and getting confused with the concepts.",
    tags: ["#Machine Learning", "#Help", "#Exam"], likes: 7, comments: 15,
  },
];

const TYPE_COLORS = {
  Announcement: "#1E3A5F",
  Project: "#C1623F",
  Doubt: "#E08C3F",
  Achievement: "#4A9E6E",
};

export default function Feed() {
  const location = useLocation();
  const role = location.state?.role || "student";

  const [activeFilter, setActiveFilter] = useState("All");
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [likedPosts, setLikedPosts] = useState([]);

  const filtered = activeFilter === "All"
    ? posts
    : posts.filter(p => p.type === activeFilter.slice(0, -1) || p.type === activeFilter);

  function toggleLike(id) {
    setLikedPosts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likes: likedPosts.includes(id) ? p.likes - 1 : p.likes + 1 } : p
    ));
  }

  const accentColor = role === "student" ? "#C1623F" : "#1E3A5F";

  return (
    <div className="page-layout">
      <Sidebar role={role} />
      <main className="page-main">
        <div className="page-content">
          <div className="feed-header">
            <div>
              <h1 className="page-title">Feed</h1>
              <p className="page-subtitle">Stay updated with announcements, projects, and discussions</p>
            </div>
          </div>

          <div className="filter-bar">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? "filter-btn--active" : ""}`}
                style={activeFilter === f ? { background: accentColor, color: "#fff", borderColor: accentColor } : {}}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="posts-list">
            {filtered.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="post-avatar" style={{ background: post.avatarBg + "22" }}>
                      {post.avatar}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="post-author">{post.author}</span>
                        <span className="post-role-badge" style={{
                          color: post.role === "Teacher" ? "#1E3A5F" : "#C1623F",
                          background: (post.role === "Teacher" ? "#1E3A5F" : "#C1623F") + "15",
                        }}>{post.role}</span>
                      </div>
                      <span className="post-time">{post.time}</span>
                    </div>
                  </div>
                  <span className="post-type-badge" style={{ color: TYPE_COLORS[post.type] || "#666" }}>
                    {post.type}
                  </span>
                </div>

                <p className="post-content">{post.content}</p>

                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                <div className="post-actions">
                  <button
                    className={`action-btn ${likedPosts.includes(post.id) ? "action-btn--liked" : ""}`}
                    onClick={() => toggleLike(post.id)}
                    style={likedPosts.includes(post.id) ? { color: accentColor } : {}}
                  >
                    ♥ {post.likes}
                  </button>
                  <button className="action-btn">💬 {post.comments}</button>
                  <button className="action-btn">↗ Share</button>
                  <button className="action-btn bookmark-btn">🔖</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}