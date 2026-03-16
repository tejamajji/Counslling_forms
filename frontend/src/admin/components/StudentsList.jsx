import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

function StudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [rollSearch, setRollSearch] = useState('');
  const [regYearFilter, setRegYearFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    apiClient.get("/api/superadmin/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(res => setStudents(res.data))
    .catch(err => console.error(err));
  }, []);

  const getRegistrationYear = (email) => {
    if (!email) return null;
    const prefix = email.split('@')[0] || '';
    // Expect roll number format like 322103311030, where the registration year is the 2nd+3rd digits (e.g. 22 => 2022)
    if (/^\d{3,}/.test(prefix)) {
      const yearDigits = prefix.slice(1, 3);
      return `20${yearDigits}`;
    }
    return null;
  };

  const availableYears = Array.from(
    new Set(students.map((s) => getRegistrationYear(s.email)).filter(Boolean))
  ).sort();

  const filteredStudents = students.filter((s) => {
    const q = rollSearch.trim().toLowerCase();
    const matchesSearch = !q || s.username?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (!regYearFilter) return true;

    const studentYear = getRegistrationYear(s.email);
    return studentYear === regYearFilter;
  });

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [rollSearch, regYearFilter]);

  return (
    <div>
      <button onClick={() => navigate("/superadmin/dashboard")} style={{ marginBottom: "10px" }}>Back to Dashboard</button>
      <h2>Students</h2>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by name or roll number"
          value={rollSearch}
          onChange={(e) => setRollSearch(e.target.value)}
          style={{ padding: '6px', width: '260px' }}
        />
        <select
          value={regYearFilter}
          onChange={(e) => setRegYearFilter(e.target.value)}
          style={{ padding: '6px', width: '200px' }}
        >
          <option value="">All registration years</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
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
