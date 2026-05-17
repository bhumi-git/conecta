import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState} from "react";
import "./landing.css";
import studentIcon from "/student.png";
import teacherIcon from "/teacher.png";

export default function Landing() {
  const [dark, setDark] = useState(false)

useEffect(() => {
  document.body.style.background = dark ? "#0E0E0E" : "#fdf8f3"
}, [dark])
  const navigate  = useNavigate();
  const heroRef   = useRef(null);

  // Subtle parallax on mouse move
  useEffect(() => {
    const handleMouse = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth  - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      if (heroRef.current) {
        heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className={`landing-root ${dark ? "dark" : ""}`}>

      {/* ── Background orbs ───────────────────────── */}
      <div className="orb orb-orange" />
      <div className="orb orb-navy"   />
      <div className="orb orb-peach"  />

      {/* ── Grain overlay ─────────────────────────── */}
      <div className="grain" />

      {/* ── Nav ───────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-mark">C</span>
          <span className="nav-logo-text">Conecta</span>
        </div>
        <button
  onClick={() => setDark(d => !d)}
  style={{
    width: 42, height: 24, borderRadius: 12, border: "none",
    cursor: "pointer", position: "relative",
    background: dark ? "#fc6837" : "#ddd",
    transition: "background 0.2s",
  }}
>
  <div style={{
    position: "absolute", top: 3,
    left: dark ? 21 : 3,
    width: 18, height: 18,
    borderRadius: "50%", background: "#fff",
    transition: "left 0.2s",
  }} />
</button>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero">

        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          Welcome to Conecta
        </div>

        <h1 className="hero-title">
          Where Learning<br />
          <em>Meets Connection</em>
        </h1>

        <p className="hero-sub">
          A unified academic space to collaborate, grow,<br />
          and bridge the gap between students and educators.
        </p>

        {/* ── Cards ─────────────────────────────── */}
        <div className="landing-cards" ref={heroRef}>

          {/* Student */}
          <div className="landing-card student-card">
            <div className="card-glow student-glow" />
            <div className="card-inner">

              <div className="card-icon-wrap student-icon-wrap">
                <img src={studentIcon} className="card-icon" alt="Student" />
              </div>

              <div className="card-tag student-tag">Student</div>

              <h2 className="card-heading">Learn &amp; Grow</h2>

              <p className="card-desc">
                Connect with mentors, find collaborators,
                and unlock your academic potential.
              </p>

              

              <button
                className="card-btn student-btn"
                onClick={() => {
                  localStorage.setItem("selectedRole", "student");
                  navigate("/auth", { state: { role: "student" } });
                }}
              >
                <span>Continue as Student</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

            </div>
          </div>

          {/* Teacher */}
          <div className="landing-card teacher-card">
            <div className="card-glow teacher-glow" />
            <div className="card-inner">

              <div className="card-icon-wrap teacher-icon-wrap">
                <img src={teacherIcon} className="card-icon" alt="Teacher" />
              </div>

              <div className="card-tag teacher-tag">Teacher</div>

              <h2 className="card-heading">Teach &amp; Inspire</h2>

              <p className="card-desc">
                Guide students, post announcements,
                and shape the next generation of talent.
              </p>


              <button
                className="card-btn teacher-btn"
                onClick={() => {
                  localStorage.setItem("selectedRole", "teacher");
                  navigate("/auth", { state: { role: "teacher" } });
                }}
              >
                <span>Continue as Teacher</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

            </div>
          </div>

        </div>{/* /landing-cards */}

      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="landing-footer">
        <span>© 2026 Conecta</span>
        <span className="footer-dot">·</span>
        <span>Academic Network Platform</span>
        <span className="footer-dot">·</span>
        <span>Built with Firebase + React</span>
      </footer>

    </div>
  );
}