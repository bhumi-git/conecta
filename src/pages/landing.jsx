import { useNavigate } from "react-router-dom";
import "./landing.css";
import studentIcon from "/student.png";
import teacherIcon from "/teacher.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container">

      {/* Background Blobs */}
      <div className="blur blur1"></div>
      <div className="blur blur2"></div>

      <div className="hero">
        <h1 className="title">
          Welcome to <span>Conecta</span>
        </h1>

        <p className="subtitle">
          Build meaningful academic connections between students and mentors.
        </p>
      
      </div>

      <div className="cards">

        {/* STUDENT CARD */}
        <div className="card student">

          <div className="topGlow"></div>

          <img src={studentIcon} className="icon" alt="student" />

          <h2>Student</h2>

          <p>
            Connect with mentors, ask doubts, discover opportunities &
            collaborate with peers.
          </p>

          <button
            className="button"
            onClick={() => {
              localStorage.setItem("selectedRole", "student");
              navigate("/auth", { state: { role: "student" } });
            }}
          >
            Continue →
          </button>
        </div>

        {/* TEACHER CARD */}
        <div className="card teacher">

          <div className="topGlow"></div>

          <img src={teacherIcon} className="icon" alt="teacher" />

          <h2>Teacher</h2>

          <p>
            Guide students, share knowledge, post projects and mentor future innovators.
          </p>

          <button
            className="button"
            onClick={() => {
              localStorage.setItem("selectedRole", "teacher");
              navigate("/auth", { state: { role: "teacher" } });
            }}
          >
            Continue →
          </button>
        </div>

      </div>
    </div>
  );
}