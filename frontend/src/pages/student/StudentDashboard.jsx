import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AnalyticsCard from "../../components/dashboard/AnalyticsCard";
import ClaimCard from "../../components/dashboard/ClaimCard";

function StudentDashboard({ externalClaims = [] }) {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const claims = externalClaims;

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const pending = claims.filter(c => c.status === "PENDING").length;
  const onHold = claims.filter(c => c.status === "ON_HOLD").length;
  const approved = claims.filter(c => c.status === "APPROVED").length;
  const rejected = claims.filter(c => c.status === "REJECTED").length;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const profileIncomplete =
    profile &&
    (!profile.department ||
      !profile.year ||
      !profile.rollNo ||
      !profile.githubUrl ||
      !profile.linkedinUrl);

  const handleEdit = (id) => {
    alert("Edit clicked for claim ID: " + id);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Dashboard</h2>

      {/* PROFILE INCOMPLETE BANNER */}
      {!profileLoading && profileIncomplete && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            borderRadius: "6px",
            color: "#856404",
          }}
        >
          <strong>Profile incomplete.</strong>  
          You must complete your profile before submitting achievements.
          <button
            style={{
              marginLeft: "12px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/student/profile")}
          >
            Go to Profile
          </button>
        </div>
      )}

      {/* Top actions */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/student/submit")}>
          + Submit Achievement
        </button>

        <button
          style={{ marginLeft: "12px" }}
          onClick={() => navigate("/student/profile")}
        >
          View Profile
        </button>

        <button
          style={{ marginLeft: "12px" }}
          onClick={() => navigate("/leaderboard")}
        >
          Leaderboard
        </button>

        <button
          style={{ marginLeft: "12px" }}
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {/* Analytics */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <AnalyticsCard title="Pending" value={pending} />
        <AnalyticsCard title="On Hold" value={onHold} />
        <AnalyticsCard title="Approved" value={approved} />
        <AnalyticsCard title="Rejected" value={rejected} />
        <AnalyticsCard title="Rank" value="—" />
      </div>

      <h3 style={{ marginTop: "40px" }}>My Claims</h3>

      {claims.map((claim) => (
        <ClaimCard
          key={claim.id}
          claim={claim}
          onDelete={() => {}}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}

export default StudentDashboard;