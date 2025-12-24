import { useState } from "react";
import { mockStudent } from "../../data/mockStudents";

function ProfilePage({ isSelf = false, onBack }) {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(mockStudent);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h2>Student Profile</h2>

      <div style={{ marginTop: "20px" }}>
        <label>Name</label>
        <input
          disabled={!editing}
          value={profile.name}
          onChange={(e) => handleChange("name", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Department</label>
        <input
          disabled={!editing}
          value={profile.department}
          onChange={(e) => handleChange("department", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Year</label>
        <input
          disabled={!editing}
          value={profile.year}
          onChange={(e) => handleChange("year", e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Rank</label>
        <input
          disabled
          value={profile.rank}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        {isSelf && !editing && (
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        )}

        {isSelf && editing && (
          <button onClick={() => setEditing(false)}>Save</button>
        )}

        <button 
          onClick={() => {
            setEditing(false);
            onBack();
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
