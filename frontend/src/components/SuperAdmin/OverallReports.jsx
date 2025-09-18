import { useState } from "react";
import axios from "axios";

function OverallReports() {
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");

  const fetch = () => {
    axios.get(`http://localhost:5000/api/superadmin/reports?class=${className}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(res => setStudents(res.data))
    .catch(err => console.error(err));
  };

  return (
    <div>
      <input placeholder="Class name" onChange={e => setClassName(e.target.value)} />
      <button onClick={fetch}>Fetch</button>
      <ul>{students.map(s => <li key={s._id}>{s.name}</li>)}</ul>
    </div>
  );
}

export default OverallReports;
