// FILE: frontend/src/pages/LeaderboardPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function formatDate(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const role = user?.role || "";
  const isStudent = role === "student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rows, setRows] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myMentorSet, setMyMentorSet] = useState(new Set());

  // Filters (client UI, server applied)
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [commonMentors, setCommonMentors] = useState(""); // only for students

  const backRoute = useMemo(() => {
    if (role === "mentor") return "/mentor";
    if (role === "proctor") return "/proctor";
    return "/student";
  }, [role]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (department) params.set("department", department);
    if (year) params.set("year", year);
    if (isStudent && commonMentors) params.set("commonMentors", commonMentors);
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [department, year, commonMentors, isStudent]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/leaderboard${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load leaderboard");
      }

      setRows(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      setMyRank(isStudent ? (data.myRank ?? null) : null);
    } catch (e) {
      setError(e.message || "Failed to load leaderboard");
      setRows([]);
      setMyRank(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, queryString]);

  useEffect(() => {
    if (!isStudent || !token) return;

    fetch(`${import.meta.env.VITE_API_BASE_URL}/leaderboard/me/mentors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMyMentorSet(new Set(data.mentorIds || []));
      })
      .catch(() => {
        setMyMentorSet(new Set());
      });
  }, [token, isStudent]);

  // Filter rows based on common mentors intersection
  const filteredRows = useMemo(() => {
    if (!isStudent || !commonMentors) return rows;

    const minCommon = Number(commonMentors);
    if (minCommon < 1) return rows;

    return rows.filter((r) => {
      if (!Array.isArray(r.mentorIds)) return false;

      const theirMentors = new Set(r.mentorIds);

      let commonCount = 0;
      myMentorSet.forEach((m) => {
        if (theirMentors.has(m)) commonCount++;
      });

      return commonCount >= minCommon;
    });
  }, [rows, isStudent, commonMentors, myMentorSet]);

  // Build dropdown options from returned data to avoid hardcoding departments/years
  const deptOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [rows]);

  const yearOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.year !== undefined && r.year !== null && r.year !== "") set.add(String(r.year));
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [rows]);

  // Calculate max common mentors for dropdown (1 to myMentorSet.size)
  const maxCommonMentors = myMentorSet.size;
  const commonMentorOptions = useMemo(() => {
    if (!isStudent || maxCommonMentors === 0) return [];
    return Array.from({ length: maxCommonMentors }, (_, i) => i + 1);
  }, [isStudent, maxCommonMentors]);

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Leaderboard</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate(backRoute)}>← Back</button>
          <button onClick={fetchLeaderboard} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {/* Student-only rank banner */}
      {isStudent && !loading && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          <strong>Your Rank:</strong> {myRank ? `#${myRank}` : "—"}
          <span style={{ marginLeft: 10, color: "#666" }}>
            (based on approved competitions; tie-breaker: latest approval time)
          </span>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          marginTop: 16,
          padding: 14,
          border: "1px solid #eee",
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#555" }}>Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ padding: 8, minWidth: 200 }}
            >
              <option value="">All</option>
              {deptOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#555" }}>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: 8, minWidth: 120 }}>
              <option value="">All</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {isStudent && (
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>
                Common Mentors (≥)
              </label>
              <select
                value={commonMentors}
                onChange={(e) => setCommonMentors(e.target.value)}
                style={{ padding: 8, minWidth: 160 }}
              >
                <option value="">Off</option>
                {commonMentorOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {commonMentors !== "" && (
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  Filtering students with ≥{commonMentors} common mentor(s)
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setDepartment("");
              setYear("");
              setCommonMentors("");
            }}
            style={{ padding: "8px 12px" }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Status */}
      {error && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f5c2c7", background: "#f8d7da", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ borderBottom: "1px solid #ddd", padding: 10 }}>Rank</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: 10 }}>Student</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: 10 }}>Department</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: 10 }}>Year</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: 10 }}>Approved</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: 10 }}>Latest Approved</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 12, color: "#666" }}>
                    {commonMentors && rows.length > 0
                      ? `No students found with ≥${commonMentors} common mentor(s)`
                      : "No data yet (need approved claims)."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  // Use index-based ranking for filtered rows
                  const computedRank = idx + 1;
                  const highlight = isStudent && user?._id && (r.studentId === user._id || r.studentId === user.id);

                  return (
                    <tr
                      key={r.studentId}
                      style={{
                        background: highlight ? "#e8f4ff" : "transparent",
                      }}
                    >
                      <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                        #{computedRank}
                      </td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{r.email}</div>
                      </td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                        {r.department || "—"}
                      </td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                        {r.year ?? "—"}
                      </td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                        {r.approvedCount}
                      </td>
                      <td style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                        {formatDate(r.latestApprovedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
            Ranking = Approved competitions (desc). Tie-breaker = latest approval time (desc).
            {commonMentors && ` Showing ${filteredRows.length} of ${rows.length} student(s) with ≥${commonMentors} common mentor(s).`}
          </div>
        </div>
      )}
    </div>
  );
}