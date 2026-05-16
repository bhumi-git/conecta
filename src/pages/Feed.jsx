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
  {
    id: 4, author: "Prof. James Miller", role: "Teacher", avatar: "👨‍🏫",
    avatarBg: "#1E3A5F", time: "2 days ago", type: "Announcement",
    content: "Congratulations to all students who completed the Web Development bootcamp! Results are out — 92% pass rate this cohort. Proud of every one of you.",
    tags: ["#WebDev", "#Results", "#Achievement"], likes: 42, comments: 19,
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
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ type: "Announcement", content: "", tags: "" });

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

  function handleCreatePost() {
    if (!newPost.content.trim()) return;
    const post = {
      id: Date.now(),
      author: "Guest User",
      role: role === "student" ? "Student" : "Teacher",
      avatar: role === "student" ? "🎓" : "📘",
      avatarBg: role === "student" ? "#C1623F" : "#1E3A5F",
      time: "Just now",
      type: newPost.type,
      content: newPost.content,
      tags: newPost.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`),
      likes: 0, comments: 0,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost({ type: "Announcement", content: "", tags: "" });
    setShowModal(false);
  }

  const accentColor = role === "student" ? "#C1623F" : "#1E3A5F";

  return (
    <div className="page-layout">
      <Sidebar role={role} />
      <main className="page-main">
        <div className="page-content">

          {/* Header */}
          <div className="feed-header">
            <div>
              <h1 className="page-title">Feed</h1>
              <p className="page-subtitle">Stay updated with announcements, projects, and discussions</p>
            </div>
            <button className="create-btn" style={{ background: accentColor }} onClick={() => setShowModal(true)}>
              + Create Post
            </button>
          </div>

          {/* Filters */}
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

          {/* Posts */}
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

      {/* Create Post Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Post</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <label className="modal-label">Post Type</label>
              <div className="type-selector">
                {["Announcement", "Project", "Doubt", "Achievement"].map(t => (
                  <button
                    key={t}
                    className={`type-btn ${newPost.type === t ? "type-btn--active" : ""}`}
                    style={newPost.type === t ? { background: accentColor, color: "#fff", borderColor: accentColor } : {}}
                    onClick={() => setNewPost(p => ({ ...p, type: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <label className="modal-label">What's on your mind?</label>
              <textarea
                className="modal-textarea"
                placeholder="Share your thoughts, announcements, or questions..."
                value={newPost.content}
                onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
              />

              <label className="modal-label">Tags (comma separated)</label>
              <input
                className="modal-input"
                placeholder="e.g. Machine Learning, React, AI"
                value={newPost.tags}
                onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))}
              />
            </div>

            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-submit" style={{ background: accentColor }} onClick={handleCreatePost}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
