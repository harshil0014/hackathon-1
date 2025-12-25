import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function SubmitPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [mentorEmailsInput, setMentorEmailsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const handleSubmit = async () => {
    if (!title || !eventName || !organizer || !eventStartDate || !proofFile) {
      alert("Please fill all required fields and upload proof");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", "");
      formData.append("eventName", eventName);
      formData.append("organizer", organizer);
      formData.append("eventStartDate", eventStartDate);
      if (eventEndDate) formData.append("eventEndDate", eventEndDate);
      if (verificationLink)
        formData.append("verificationLink", verificationLink);

      mentorEmailsInput
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .forEach((email) => {
          formData.append("mentorEmails", email);
        });

      formData.append("proof", proofFile);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/claims/student`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit claim");
      }

      navigate("/student");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h2>Submit Achievement</h2>

      <div style={{ marginTop: "16px" }}>
        <label>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Category *</label>
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

      <div style={{ marginTop: "16px" }}>
        <label>Event Name *</label>
        <input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Organizer *</label>
        <input
          value={organizer}
          onChange={(e) => setOrganizer(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Event Start Date *</label>
        <input
          type="date"
          value={eventStartDate}
          onChange={(e) => setEventStartDate(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Event End Date</label>
        <input
          type="date"
          value={eventEndDate}
          onChange={(e) => setEventEndDate(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Verification Link</label>
        <input
          value={verificationLink}
          onChange={(e) => setVerificationLink(e.target.value)}
          placeholder="Optional"
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Upload Proof (PDF / Image) *</label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setProofFile(e.target.files[0])}
          style={{ width: "100%", marginTop: "6px" }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <label>Mentor Email(s)</label>
        <input
          placeholder="deven.m@somaiya.edu, xyz@somaiya.edu"
          value={mentorEmailsInput}
          onChange={(e) => setMentorEmailsInput(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "6px" }}
        />
        <small style={{ color: "#aaa" }}>
          Only mentors or proctors can be tagged. Separate multiple emails with commas.
        </small>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        <button onClick={() => navigate("/student")} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SubmitPage;