function AnalyticsCard({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        minWidth: "130px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "14px", color: "#666" }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default AnalyticsCard;
