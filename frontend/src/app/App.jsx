import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/student/StudentDashboard";
import SubmitPage from "../pages/student/SubmitPage";
import ProfilePage from "../pages/student/ProfilePage";
import ProctorDashboard from "../pages/proctor/ProctorDashboard";
import MentorDashboard from "../pages/mentor/MentorDashboard";
import LeaderboardPage from "../pages/LeaderboardPage";
import { useEffect, useState } from "react";

function App() {
  const { user, isAuthenticated, token } = useAuth();

  // student state - proctor state removed as it's now handled in ProctorDashboard
  const [claims, setClaims] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // STUDENT - Only fetch student claims
        if (user.role === "student") {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/claims/student`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) throw new Error("Failed to fetch student claims");

          const data = await res.json();
          setClaims(data.claims || []);
        }

        // PROCTOR fetch removed - ProctorDashboard handles its own data fetching
        // This eliminates redundant network calls and simplifies state management
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, token]);

  // 🔒 Not logged in
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px" }}>{error}</div>;
  }

  /* ===================== ROUTES ===================== */

  // STUDENT ROUTES
  if (user.role === "student") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />

        <Route
          path="/student"
          element={<StudentDashboard externalClaims={claims} />}
        />

        <Route path="/student/submit" element={<SubmitPage />} />

        <Route
          path="/student/profile"
          element={<ProfilePage isSelf={true} />}
        />

        <Route path="/leaderboard" element={<LeaderboardPage />} />

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    );
  }

  // PROCTOR ROUTES
  if (user.role === "proctor") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/proctor" replace />} />
        <Route path="/proctor" element={<ProctorDashboard />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/proctor" replace />} />
      </Routes>
    );
  }

  // MENTOR ROUTES
  if (user.role === "mentor") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/mentor" replace />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/mentor" replace />} />
      </Routes>
    );
  }

  // fallback
  return <div>Role not supported</div>;
}

export default App;