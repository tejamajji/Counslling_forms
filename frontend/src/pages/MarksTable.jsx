import React, { useState } from 'react';
import axios from 'axios';

const MarksTable = () => {
  const subjectsList = [
    ['M1', 'BEEE', 'English', 'Chemistry', 'Additional Subject'], // Table 1
    ['Physics', 'STLD', 'M2', 'C Language', 'Physical Education'], // Table 2
    ['Java', 'Operating Systems', 'Computer Organization', 'M3', 'DSA'],
    ['DAA', 'Accounts', 'Flat', 'M4', 'DBMS'],
    ['CN', 'DWDM', 'ADSA', 'OOAD', 'OE'],
    // Add more subject arrays for additional tables
  ];

  const [currentTable, setCurrentTable] = useState(0); // Keeps track of the current table page
  const [marks, setMarks] = useState({}); // Stores the marks for each subject
  const [cgpa, setCgpa] = useState(''); // Stores the overall CGPA

  const handleTableSelect = (tableIndex) => {
    setCurrentTable(tableIndex - 1); // Adjust for zero-based index
  };

  const handleInputChange = (subject, field, value) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [subject]: {
        ...prevMarks[subject],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const semester = currentTable + 1; // Current semester
    const email = "322103311018@gvpce.ac.in"; // Replace with actual student email
    const subjects = Object.keys(marks).map((subject) => ({
      subject,
      ...marks[subject],
    }));

    const payload = { email, semester, cgpa, subjects };

    axios
      .post('http://localhost:5000/api/semester', payload)
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        console.error('Error submitting marks:', error);
        alert('Failed to submit marks.');
      });
  };

  const currentSubjects = subjectsList[currentTable] || []; // Get subjects for the current table

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div
        style={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff',
          width: '80%',
          position: 'relative',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Student Marks Details - Table {currentTable + 1}</h2>
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Mid 1</th>
              <th>Mid 2</th>
              <th>Avg Mid</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {currentSubjects.map((subject, index) => (
              <tr key={index}>
                <td>{subject}</td>
                <td><input type="number" placeholder="Midterm 1" onChange={(e) => handleInputChange(subject, 'mid1', e.target.value)} /></td>
                <td><input type="number" placeholder="Midterm 2" onChange={(e) => handleInputChange(subject, 'mid2', e.target.value)} /></td>
                <td><input type="number" placeholder="Average Mid" onChange={(e) => handleInputChange(subject, 'average', e.target.value)} /></td>
                <td><input type="text" placeholder="Grade" onChange={(e) => handleInputChange(subject, 'grade', e.target.value)} /></td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Overall CGPA: <input type="number" placeholder="Enter CGPA" style={{ width: '50%' }} onChange={(e) => setCgpa(e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>
        <button style={{ display: 'block', margin: '0 auto', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={handleSubmit}>
          Submit Marks
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '80%',
        backgroundColor: '#fff',
        padding: '10px 0',
        borderRadius: '5px 5px 0 0',  // Rounded top corners
        boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
        marginTop: '10px'  // Decreased space above scroll bar
      }}>
        {Array.from({ length: 8 }, (_, index) => (
          <button
            key={index + 1}
            style={{
              margin: '0 5px',
              padding: '5px 10px',
              cursor: 'pointer',
              backgroundColor: currentTable === index ? '#007bff' : '#f0f0f0',
              color: currentTable === index ? '#fff' : '#000',
            }}
            onClick={() => handleTableSelect(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarksTable;
 