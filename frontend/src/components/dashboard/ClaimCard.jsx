import StatusBadge from "../ui/StatusBadge";

function ClaimCard({ claim, onDelete, onEdit }) {
  const isPending = claim.status === "PENDING";

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      <h4>{claim.title}</h4>

      <p style={{ fontSize: "13px", color: "#555" }}>
        {claim.type} • Submitted on {claim.submittedAt}
      </p>

      <div style={{ marginTop: "8px" }}>
        <StatusBadge status={claim.status} />
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <button onClick={() => onEdit(claim.id)}>Edit</button>
          <button onClick={() => onDelete(claim.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default ClaimCard;
