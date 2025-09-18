import { Link } from "react-router-dom";

function SuperAdminDashboard() {
  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <ul>
        <li><Link to="/superadmin/admins">Manage Admins</Link></li>
        <li><Link to="/superadmin/admins/create">Create Admin</Link></li>
        <li><Link to="/superadmin/students">View Students</Link></li>
        <li><Link to="/superadmin/reports">Overall Reports</Link></li>
      </ul>
    </div>
  );
}

export default SuperAdminDashboard;
