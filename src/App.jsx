// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing.jsx";
import Auth from "./pages/auth.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import Feed from "./pages/Feed.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Role Selection / Welcome */}
        <Route path="/" element={<Landing />} />

        {/* Login & Signup */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboards */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />

        {/*Feed*/}
        <Route path="/feed" element={<Feed />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;