import { useState } from "react";
import StudentDashboard from "../pages/student/StudentDashboard";
import SubmitPage from "../pages/student/SubmitPage";
import ProfilePage from "../pages/student/ProfilePage";

function App() {
  const [page, setPage] = useState("dashboard");
  const [claims, setClaims] = useState([]);

  const handleAddClaim = (claim) => {
    setClaims(prev => [claim, ...prev]);
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

      {page == "profile" && (
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
