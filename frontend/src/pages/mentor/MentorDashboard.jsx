// FILE: frontend/src/pages/mentor/MentorDashboard.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

function MentorDashboard() {
  const { token, logout } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/claims/mentor`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch mentor claims");
        }

        const data = await res.json();
        setClaims(data.claims || []);
      } catch (err) {
        console.error(err);
        setError("Could not load mentor claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [token]);

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

      if (!res.ok) throw new Error("Failed to fetch proof");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Unable to view proof");
    }
  };

  const downloadProof = async (claimId, claimTitle) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/claims/${claimId}/proof/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to download proof");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = claimTitle || "proof";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Unable to download proof");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading mentor dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Mentor Dashboard</h2>

      <button style={{ marginBottom: "20px" }} onClick={logout}>
        Logout
      </button>

      <p>Approved Claims Assigned to You: {claims.length}</p>

      {claims.length === 0 && <p>No approved claims yet.</p>}

      {claims.map((claim) => (
        <div
          key={claim._id}
          style={{
            border: "1px solid #444",
            padding: "16px",
            marginTop: "12px",
            borderRadius: "8px",
          }}
        >
          <strong>{claim.title}</strong>

          <div>Category: {claim.category}</div>
          <div>Status: {claim.status}</div>

          <hr />

          <div><strong>Event:</strong> {claim.eventName}</div>
          <div><strong>Organizer:</strong> {claim.organizer}</div>
          <div>
            <strong>Dates:</strong>{" "}
            {new Date(claim.eventStartDate).toLocaleDateString()}
            {claim.eventEndDate &&
              ` → ${new Date(claim.eventEndDate).toLocaleDateString()}`}
          </div>

          {claim.verificationLink && (
            <div>
              <a
                href={claim.verificationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Verification Link
              </a>
            </div>
          )}

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

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => viewProof(claim._id)}>View Proof</button>
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => downloadProof(claim._id, claim.title)}
            >
              Download Proof
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MentorDashboard;