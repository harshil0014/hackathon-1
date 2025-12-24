import { useState } from "react";
import AnalyticsCard from "../../components/dashboard/AnalyticsCard";
import ClaimCard from "../../components/dashboard/ClaimCard";
import { mockClaims } from "../../data/mockClaims";
import { mockStudent } from "../../data/mockStudents";

function StudentDashboard({ externalClaims = [] }) {
  const [claims, setClaims] = useState([...externalClaims, ...mockClaims]);

  const pending = claims.filter(c => c.status === "PENDING").length;
  const onHold = claims.filter(c => c.status === "ON_HOLD").length;
  const approved = claims.filter(c => c.status === "APPROVED").length;
  const rejected = claims.filter(c => c.status === "REJECTED").length;

  const handleDelete = (id) => {
    setClaims(prev => prev.filter(claim => claim.id !== id));
  };

  const handleEdit = (id) => {
    alert("Edit clicked for claim ID: " + id);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Dashboard</h2>

      {/* Analytics */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <AnalyticsCard title="Pending" value={pending} />
        <AnalyticsCard title="On Hold" value={onHold} />
        <AnalyticsCard title="Approved" value={approved} />
        <AnalyticsCard title="Rejected" value={rejected} />
        <AnalyticsCard title="Rank" value={mockStudent.rank} />
      </div>

      <h3 style={{ marginTop: "40px" }}>My Claims</h3>

      {claims.map((claim) => (
        <ClaimCard
          key={claim.id}
          claim={claim}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}

export default StudentDashboard;
