import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

function ProctorDashboard() {
  const { token, logout } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const viewProof = async (claimId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/claims/${claimId}/proof/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("View failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("Could not open proof");
    }
  };

  const downloadProof = async (claimId, originalName) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/claims/${claimId}/proof/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download proof");
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/claims/proctor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch claims");
      }

      const data = await res.json();
      setClaims(data.claims || []);
    } catch (err) {
      console.error(err);
      setError("Could not load pending claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const reviewClaim = async (claimId, status) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/claims/proctor/${claimId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update claim");
      }

      // refresh list after action
      fetchClaims();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading proctor dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Proctor Dashboard</h2>

      <button
        style={{ marginBottom: "20px" }}
        onClick={() => {
          logout();
          window.location.href = "/";
        }}
      >
        Logout
      </button>

      <h3>Pending Claims: {claims.length}</h3>

      {claims.length === 0 && <p>No pending claims.</p>}

      {claims.map((claim) => {
        return (
          <div
            key={claim._id}
            style={{
              border: "1px solid #444",
              padding: "16px",
              marginTop: "16px",
              borderRadius: "8px",
            }}
          >
            <h4>{claim.title}</h4>
            <p>Category: {claim.category}</p>
            <p>Status: {claim.status}</p>

            {/* Event Details */}
            <p><b>Event:</b> {claim.eventName}</p>
            <p><b>Organizer:</b> {claim.organizer}</p>
            <p>
              <b>Date:</b>{" "}
              {new Date(claim.eventStartDate).toLocaleDateString()}
              {claim.eventEndDate &&
                ` - ${new Date(claim.eventEndDate).toLocaleDateString()}`}
            </p>

            {/* Student Details */}
            {claim.studentId && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "#111827",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <b>Student Details</b>
                <p style={{ marginTop: "6px" }}>
                  <b>Name:</b> {claim.studentId.name}
                </p>
                <p>
                  <b>Email:</b> {claim.studentId.email}
                </p>
                <p>
                  <b>Department:</b> {claim.studentId.department || "—"}
                </p>
                <p>
                  <b>Year:</b> {claim.studentId.year || "—"}
                </p>
                <p>
                  <b>Roll No:</b> {claim.studentId.rollNo || "—"}
                </p>

                <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                  {claim.studentId.githubUrl && (
                    <a
                      href={claim.studentId.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#60a5fa" }}
                    >
                      GitHub
                    </a>
                  )}
                  {claim.studentId.linkedinUrl && (
                    <a
                      href={claim.studentId.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#60a5fa" }}
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Proof File Section */}
            {claim.proofFile && (
              <div style={{ marginTop: "10px" }}>
                <b>Proof:</b>{" "}
                <button
                  onClick={() => viewProof(claim._id)}
                  style={{
                    marginLeft: "8px",
                    marginRight: "8px",
                    background: "#3b82f6",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View
                </button>
                <button
                  onClick={() =>
                    downloadProof(claim._id, claim.proofFile.originalName)
                  }
                  style={{
                    background: "#1f2937",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Download
                </button>
              </div>
            )}

            {/* Claim Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button onClick={() => reviewClaim(claim._id, "APPROVED")}>
                Approve
              </button>

              <button onClick={() => reviewClaim(claim._id, "REJECTED")}>
                Reject
              </button>

              <button onClick={() => reviewClaim(claim._id, "ON_HOLD")}>
                On Hold
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProctorDashboard;