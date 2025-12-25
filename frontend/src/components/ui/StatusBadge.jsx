import { STATUS } from "../../constants/status";

function StatusBadge({ status }) {
  const config = STATUS[status];

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        backgroundColor: "#f3f4f6",
      }}
    >
      {config?.label || status}
    </span>
  );
}

export default StatusBadge;
