import { useLocation, useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import "./auth.css";
import { auth, db } from "./firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";


export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = location.state?.role || "student";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  if (darkMode) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}, [darkMode]);

  // ── Friendly error messages ──────────────────────────────────────────
  function getFriendlyError(code) {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      case "auth/network-request-failed":
        return "Network error. Check your internet connection.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  // ── Save role to Firestore ───────────────────────────────────────────
 const saveUserRoleToFirestore = async (uid, userEmail, roleToSave) => {
  const userDocRef = doc(db, "users", uid)
  const userDocSnap = await getDoc(userDocRef)
  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      email:       userEmail,
      role:        roleToSave,
      name:        "",          // ← user sets this in Settings
      bio:         "",
      department:  "",
      semester:    roleToSave === "student" ? "" : null,
      designation: roleToSave === "teacher" ? "" : null,
      subject:     roleToSave === "teacher" ? "" : null,
      location:    "",
      interests:   [],
      skills:      [],
      achievements:[],
      connections: [],
      stats: {
        connections:     0,
        projects:        0,
        messages:        0,
        achievements:    0,
        students:        0,
        projectsPosted:  0,
        queriesAnswered: 0,
        impactScore:     0,
      },
      createdAt: new Date(),
    })
  }
}

  // ── Google Login ─────────────────────────────────────────────────────
const handleGoogleLogin = async () => {

  try {

    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log("Google User:", user);

    const role =
      localStorage.getItem("selectedRole") || initialRole;

    // Save role locally
    localStorage.setItem("role", role);

    // Firestore reference
    const userRef = doc(db, "users", user.uid);

    // Check if user exists
    const userSnap = await getDoc(userRef);

    // Create user only if not exists
    if (!userSnap.exists()) {

      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        role: role,
        createdAt: new Date(),
      });

    }

    console.log("Navigating to dashboard");

    navigate(`/dashboard/${role}`);

  } catch (error) {

    console.log(error);

    setError(error.message);

  } finally {

    setLoading(false);

  }
};
  // ── Sign Up ──────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await saveUserRoleToFirestore(user.uid, user.email, selectedRole);
      console.log("Auth signup successful - navigating to:", `/dashboard/${selectedRole}`);
      setError("");
      navigate(`/dashboard/${selectedRole}`, { state: { role: selectedRole } }); // ✅ fixed
    } catch (err) {
      console.error("Signup error", err);
      const friendly = err.code ? getFriendlyError(err.code) : "Something went wrong. Please try again.";
      setError(`${friendly}${err.code ? ` (${err.code})` : ""}: ${err.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      let userDocSnap = null;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (err) {
        console.error("Firestore getDoc error (Login)", err);
        if (err.code === "unavailable" || /offline/i.test(err.message || "")) {
          setError("Network appears offline. Logging in with local credentials; role may be unavailable until online.");
          userDocSnap = null;
        } else {
          throw err;
        }
      }

      let userRole = initialRole;
      if (userDocSnap && userDocSnap.exists()) {
        userRole = userDocSnap.data()?.role || initialRole;
      } else if (!userDocSnap) {
        // offline or couldn't read doc: fallback to initialRole (preserves navigation)
        userRole = initialRole;
      } else {
        await saveUserRoleToFirestore(user.uid, user.email, initialRole);
      }

      console.log("Email login successful - navigating to:", `/dashboard/${userRole}`);
      setError("");
      navigate(`/dashboard/${userRole}`, { state: { role: userRole } }); // ✅ fixed
    } catch (err) {
      console.error("Login error", err);
      const friendly = err.code ? getFriendlyError(err.code) : "Something went wrong. Please try again.";
      setError(`${friendly}${err.code ? ` (${err.code})` : ""}: ${err.message || ""}`);
    } finally {
      setLoading(false);
    }
  };
 const handleGuestLogin = async () => {

  try {

    // anonymous firebase login
    await signInAnonymously(auth);

    // get selected role
    const selectedRole = localStorage.getItem("selectedRole");

    console.log(selectedRole);

    // navigate based on role
    if (selectedRole === "student") {

      navigate("/dashboard/student");

    } else {

      navigate("/dashboard/teacher");

    }

  } catch (error) {

    console.log(error.message);

  }
};
  return (
<div>

      {/* Theme Toggle Button */}
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    <div className="container">
      <h1 className="title">{isLogin ? "Sign In" : "Create your account"}</h1>
      <p className="subtitle">
        {isLogin
          ? "Use email/password or continue with Google to access your dashboard."
          : "Enter your email, create a password, confirm it, or sign up with Google."}
      </p>

      <div className="card">

        {/* Tabs */}
        <div className="toggle">
          <button
            className={isLogin ? "activeTab" : "tab"}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={!isLogin ? "activeTab" : "tab"}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Sign Up
          </button>
        </div>

        {/* Role badge on login — with Change button */}
        {isLogin && (
          <div className="role" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p>
              Logging in as: <b>{initialRole === "student" ? "Student 🎓" : "Teacher 📘"}</b>
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "none",
                color: "#C1623F",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Change
            </button>
          </div>
        )}

        {/* Role selection on signup */}
        {!isLogin && (
          <div className="role-selection">
            <p>Signing up as:</p>
            <label>
              <input
                type="radio"
                name="user-role-signup"
                value="student"
                checked={selectedRole === "student"}
                onChange={() => setSelectedRole("student")}
              />
               Student🎓
            </label>
            <label>
              <input
                type="radio"
                name="user-role-signup"
                value="teacher"
                checked={selectedRole === "teacher"}
                onChange={() => setSelectedRole("teacher")}
              />
               Teacher📘
            </label>
          </div>
        )}

        {/* Google Button */}
        <button className="googleBtn" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/16/google-logo.png" alt="Google icon" />
          Sign in with Google
        </button>
        <button className="guestBtn" onClick={handleGuestLogin}>
   Continue as Guest
</button>

        <div className="divider">or</div>

        {/* Email */}
        <input
          className="input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Confirm Password — signup only */}
        {!isLogin && (
          <input
            className="input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {/* Error message — friendly, not raw Firebase code */}
        {error && (
          <p style={{ color: "#C1623F", textAlign: "center", marginTop: "8px", fontSize: "14px" }}>
            ⚠ {error}
          </p>
        )}

        {/* Submit */}
        <button
          className="mainBtn"
          onClick={isLogin ? handleLogin : handleSignup}
          disabled={loading}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="footer">
          {isLogin ? "New user? Switch to " : "Already have an account? "}
          <button
            style={{ background: "none", border: "none", color: "#C1623F", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

      </div>
    </div>
    </div>
  );
}
