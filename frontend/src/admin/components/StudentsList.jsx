import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

function StudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [rollSearch, setRollSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    apiClient.get("/api/superadmin/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(res => setStudents(res.data))
    .catch(err => console.error(err));
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = rollSearch.trim().toLowerCase();
    return !q || s.username?.toLowerCase().includes(q);
  });
  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [rollSearch]);

  return (
    <div>
      <button onClick={() => navigate("/superadmin/dashboard")} style={{ marginBottom: "10px" }}>Back to Dashboard</button>
      <h2>Students</h2>
      <input
        type="text"
        placeholder="Search by Roll Number"
        value={rollSearch}
        onChange={(e) => setRollSearch(e.target.value)}
        style={{ marginBottom: '10px', padding: '6px', width: '260px' }}
      />
      <table>
        <thead><tr><th>Username</th><th>Email</th><th>Actions</th></tr></thead>
        <tbody>
          {paginatedStudents.map(s => (
            <tr key={s._id}>
              <td>{s.username || 'N/A'}</td>
              <td>{s.email || 'N/A'}</td>
              <td><Link to={`/superadmin/students/${s._id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}>Prev</button>
        <span>Page {filteredStudents.length === 0 ? 0 : page + 1} of {Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage))}</span>
        <button onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / rowsPerPage) - 1))} disabled={page >= Math.ceil(filteredStudents.length / rowsPerPage) - 1}>Next</button>
        <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
}

export default StudentsList;
