import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/student/StudentDashboard";
import SubmitPage from "../pages/student/SubmitPage";
import ProfilePage from "../pages/student/ProfilePage";
import { mockClaims } from "../data/mockClaims";

function App() {
  const { user, isAuthenticated } = useAuth();

  // STEP 9: Auth check - show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // STEP 9: Role check - only student role is supported for now
  if (user.role !== "student") {
    return <div>Role not supported yet</div>;
  }

  const [page, setPage] = useState("dashboard");
  const [claims, setClaims] = useState(mockClaims);

  const handleAddClaim = (claim) => {
    const normalizedClaim = {
      ...claim,
      id: crypto.randomUUID(),
      status: "PENDING",
      reviewRemarks: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClaims(prev => [normalizedClaim, ...prev]);
    setPage("dashboard");
  };

  return (
    <div>
      <button 
        style={{ marginLeft: "20px" }}
        onClick={() => setPage("profile")}
      >
        View Profile
      </button>

      {page === "dashboard" && (
        <>
          <button
            style={{ margin: "20px" }}
            onClick={() => setPage("submit")}
          >
            + Submit Achievement
          </button>

          <StudentDashboard
            externalClaims={claims}
          />
        </>
      )}

      {page === "profile" && (
        <ProfilePage
          isSelf={true}
          onback={() => setPage("dashboard")}
        />
      )}

      {page === "submit" && (
        <SubmitPage
          onSubmit={handleAddClaim}
          onCancel={() => setPage("dashboard")}
        />
      )}
    </div>
  );
}

export default App;