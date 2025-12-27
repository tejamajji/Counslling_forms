import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../apiClient";

function StudentsList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    apiClient.get("/api/superadmin/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(res => setStudents(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Students</h2>
      <table>
        <thead><tr><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td><Link to={`/superadmin/students/${s._id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentsList;
