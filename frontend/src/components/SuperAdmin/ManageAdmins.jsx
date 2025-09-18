import { useEffect, useState } from "react";
import axios from "axios";

function ManageAdmins() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/superadmin/admins", {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(res => setAdmins(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Manage Admins</h2>
      <table>
        <thead><tr><th>Name</th><th>ID</th><th>Dept</th></tr></thead>
        <tbody>
          {admins.map(a => (
            <tr key={a._id}>
              <td>{a.employee_name}</td>
              <td>{a.employee_id}</td>
              <td>{a.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageAdmins;
