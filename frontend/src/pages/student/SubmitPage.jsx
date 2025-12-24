import { useState } from "react";

function SubmitPage({ onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Hackathon");

  const handleSubmit = () => {
    if (!title) {
      alert("Title is required");
      return;
    }

    const newClaimInput = {
      title,
      category,
      description: "",
      proofUrl: null
    };

    onSubmit(newClaimInput);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h2>Submit Achievement</h2>

      <div style={{ marginTop: "16px" }}>
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Type</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        >
          <option>Hackathon</option>
          <option>Academic</option>
          <option>Sports</option>
        </select>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default SubmitPage;