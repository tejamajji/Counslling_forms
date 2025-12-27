import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient";

function CreateAdmin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    employee_name: "", 
    employee_id: "", 
    department: "", 
    email: ""  // added here
  });

  const handleSubmit = e => {
    e.preventDefault();
    apiClient.post("/api/superadmin/admins", formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(() => {
      alert("Admin created!");
      navigate("/superadmin/admins");
    })
    .catch(err => console.error(err));
  };

  return (
    <div>
      <button onClick={() => navigate("/superadmin/dashboard")} style={{ marginBottom: "10px" }}>Back to Dashboard</button>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={e => setFormData({ ...formData, employee_name: e.target.value })} />
        <input placeholder="ID" onChange={e => setFormData({ ...formData, employee_id: e.target.value })} />
        <input placeholder="Dept" onChange={e => setFormData({ ...formData, department: e.target.value })} />
        <input placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateAdmin;
