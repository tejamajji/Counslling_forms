import { useState } from "react";
import apiClient from "../../apiClient";

function CreateAdmin() {
  const [formData, setFormData] = useState({ 
    employee_name: "", 
    employee_id: "", 
    department: "", 
    email: ""  // added here
  });

  const handleSubmit = e => {
    e.preventDefault();
    console.log(formData); // sanity check — see everything present
    apiClient.post("/api/superadmin/admins", formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(() => alert("Admin created!"))
    .catch(err => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={e => setFormData({ ...formData, employee_name: e.target.value })} />
      <input placeholder="ID" onChange={e => setFormData({ ...formData, employee_id: e.target.value })} />
      <input placeholder="Dept" onChange={e => setFormData({ ...formData, department: e.target.value })} />
      <input placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} />

      <button type="submit">Create</button>
    </form>
  );
}

export default CreateAdmin;
