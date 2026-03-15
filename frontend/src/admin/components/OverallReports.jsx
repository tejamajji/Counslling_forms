import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

function OverallReports() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetch = () => {
    let url = `/api/superadmin/reports?class=${encodeURIComponent(className)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    apiClient.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(res => {
      setStudents(res.data);
      setPage(0);
    })
    .catch(err => console.error(err));
  };

  const paginatedStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportCSV = () => {
    if (students.length === 0) return;
    
    const headers = ["Username", "Email", "Role", "ID", "Created At"];
    const rows = students.map(s => [
      `"${(s.username || "").replace(/"/g, '""')}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"${s.role || ""}"`,
      s._id,
      s.createdAt ? new Date(s.createdAt).toLocaleString() : ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    // Add BOM for correct UTF-8 encoding in Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reports_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/superadmin/dashboard")} style={{ marginBottom: "10px" }}>Back to Dashboard</button>
      
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input placeholder="Class name (e.g. B.Tech)" value={className} onChange={e => setClassName(e.target.value)} />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button onClick={fetch}>Fetch Records</button>
        <button onClick={exportCSV} disabled={students.length === 0}>Export CSV</button>
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
             <th>Username</th>
             <th>Email</th>
             <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStudents.map(s => (
            <tr key={s._id}>
              <td>{s.username || s.name}</td>
              <td>{s.email}</td>
              <td>{s.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}>Prev</button>
        <span>Page {students.length === 0 ? 0 : page + 1} of {Math.max(1, Math.ceil(students.length / rowsPerPage))}</span>
        <button onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(students.length / rowsPerPage) - 1))} disabled={page >= Math.ceil(students.length / rowsPerPage) - 1}>Next</button>
        <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
}

export default OverallReports;
