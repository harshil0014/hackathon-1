// FILE: frontend/src/pages/student/ProfilePage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    year: "",
    rollNo: "",
    githubUrl: "",
    linkedinUrl: "",
  });

  // Fetch profile
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
        console.error(err);
        alert("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Create payload with only editable fields
      const payload = {
        name: profile.name,
        department: profile.department,
        year: profile.year,
        rollNo: profile.rollNo,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save profile");

      const data = await res.json();
      setProfile(data.user);
      setEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading profile...</div>;
  }

  // Use profile.role consistently throughout the component
  const role = profile.role || user?.role || "";
  const isStudent = role === "student";
  
  // Determine the back route based on user role
  const backRoute = 
    role === "mentor" 
      ? "/mentor" 
      : role === "proctor" 
      ? "/proctor" 
      : "/student";

  return (
    <div style={{ padding: "30px", maxWidth: "520px" }}>
      <h2>My Profile</h2>

      {/* Name */}
      <div style={{ marginTop: "16px" }}>
        <label>Name</label>
        <input
          disabled={!editing}
          value={profile.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      {/* Email (read-only) */}
      <div style={{ marginTop: "16px" }}>
        <label>Email</label>
        <input
          disabled
          value={profile.email || ""}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      {/* Role (read-only) */}
      <div style={{ marginTop: "16px" }}>
        <label>Role</label>
        <input
          disabled
          value={role}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      {/* Department (ALL ROLES) */}
      <div style={{ marginTop: "16px" }}>
        <label>Department</label>
        <select
          disabled={!editing}
          value={profile.department || ""}
          onChange={(e) => handleChange("department", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        >
          <option value="">Select department</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Computer & Communication Engineering">
            Computer & Communication Engineering
          </option>
          <option value="Computer & Business Systems">
            Computer & Business Systems
          </option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electronics & Telecommunication">
            Electronics & Telecommunication
          </option>
          <option value="Robotics & Artificial Intelligence">
            Robotics & Artificial Intelligence
          </option>
          <option value="Artificial Intelligence & Machine Learning">
            Artificial Intelligence & Machine Learning
          </option>
        </select>
      </div>

      {/* Student-only fields */}
      {isStudent && (
        <>
          <div style={{ marginTop: "16px" }}>
            <label>Year</label>
            <select
              disabled={!editing}
              value={profile.year || ""}
              onChange={(e) => handleChange("year", Number(e.target.value))}
              style={{ width: "100%", padding: "8px", marginTop: "6px" }}
            >
              <option value="">Select year</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label>Roll Number</label>
            <input
              disabled={!editing}
              value={profile.rollNo || ""}
              onChange={(e) => handleChange("rollNo", e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "6px" }}
            />
          </div>
        </>
      )}

      {/* GitHub (ALL ROLES) */}
      <div style={{ marginTop: "16px" }}>
        <label>GitHub URL</label>
        <input
          disabled={!editing}
          value={profile.githubUrl || ""}
          onChange={(e) => handleChange("githubUrl", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      {/* LinkedIn (ALL ROLES) */}
      <div style={{ marginTop: "16px" }}>
        <label>LinkedIn URL</label>
        <input
          disabled={!editing}
          value={profile.linkedinUrl || ""}
          onChange={(e) => handleChange("linkedinUrl", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      {/* Actions */}
      <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
        {!editing && (
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        )}

        {editing && <button onClick={handleSave}>Save</button>}

        <button onClick={() => navigate(backRoute)}>Back</button>
      </div>
    </div>
  );
}

export default ProfilePage;