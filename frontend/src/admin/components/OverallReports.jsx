import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

function OverallReports() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [registrationYear, setRegistrationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRecords = async () => {
    if (!registrationYear.trim()) {
      setError("Please enter a registration year (e.g. 2022).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const url = `/api/superadmin/reports?registrationYear=${encodeURIComponent(registrationYear.trim())}`;
      const res = await apiClient.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setStudents(res.data);
      setPage(0);
      if (res.data.length === 0) {
        setError(`No marks records found for registration year ${registrationYear}.`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const paginatedStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportCSV = () => {
    if (students.length === 0) return;
    
    const headers = ["Registration Number", "Email", "Semester", "Subject", "Mid1", "Mid2", "External"];
    const rows = [];
    students.forEach(s => {
      (s.semesters || []).forEach(sem => {
        (sem.subjects || []).forEach(sub => {
          rows.push([
            `"${(s.registrationNumber || "").replace(/"/g, '""')}"`,
            `"${(s.email || "").replace(/"/g, '""')}"`,
            sem.semester,
            `"${(sub.subject || "").replace(/"/g, '""')}"`,
            sub.mid1,
            sub.mid2,
            `"${sub.ext || ""}"`
          ]);
        });
      });
    });
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `marks_${registrationYear}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/superadmin/dashboard")} style={{ marginBottom: "16px" }}>
        ← Back to Dashboard
      </button>

      <h2 style={{ marginBottom: "16px" }}>Overall Marks Reports</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          placeholder="Registration Year (e.g. 2022)"
          value={registrationYear}
          onChange={e => setRegistrationYear(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchRecords()}
          style={{ padding: "6px 10px", minWidth: "220px" }}
        />
        <button onClick={fetchRecords} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Records"}
        </button>
        <button onClick={exportCSV} disabled={students.length === 0}>
          Export CSV
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>
      )}

      {students.length > 0 && (
        <>
          <p style={{ marginBottom: "8px" }}>
            Showing <strong>{students.length}</strong> student(s) with marks for year <strong>{registrationYear}</strong>.
          </p>

          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Registration Number</th>
                <th>Email</th>
                <th>Semesters & Marks</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map(s => (
                <tr key={s._id}>
                  <td>{s.registrationNumber}</td>
                  <td>{s.email}</td>
                  <td>
                    {(s.semesters || []).map((sem, idx) => (
                      <div key={idx} style={{ marginBottom: "6px" }}>
                        <strong>Semester {sem.semester}:</strong>
                        {(sem.subjects || []).map((sub, subIdx) => (
                          <div key={subIdx} style={{ marginLeft: "12px" }}>
                            {sub.subject}: Mid1-{sub.mid1}, Mid2-{sub.mid2}, Ext-{sub.ext}
                          </div>
                        ))}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}>Prev</button>
            <span>Page {page + 1} of {Math.max(1, Math.ceil(students.length / rowsPerPage))}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(students.length / rowsPerPage) - 1))}
              disabled={page >= Math.ceil(students.length / rowsPerPage) - 1}
            >
              Next
            </button>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default OverallReports;
