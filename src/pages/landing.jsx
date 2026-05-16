import { useNavigate } from "react-router-dom";
import "./landing.css";
import studentIcon from "/student.png";
import teacherIcon from "/teacher.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">Welcome to Conecta</h1>
      <p className="subtitle">Choose your role to continue</p>

      <div className="cards">

        {/* STUDENT CARD */}
        <div className="student">
          <img src={studentIcon} className="icon" />

          <h2>Student</h2>
          <p>Connect with mentors,find collaborators & grow.</p>
          <br />
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
        <div className="teacher">
          <img src={teacherIcon} className="icon" />

          <h2>Teacher</h2>
          <p>Guide students,post projects, & share knowledge.</p>
          <br />
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
