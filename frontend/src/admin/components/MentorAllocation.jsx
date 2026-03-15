import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Select, MenuItem, FormControl, InputLabel, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';

const MentorAllocation = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  
  const [selectedMentor, setSelectedMentor] = useState('');
  const [assignedCountToGive, setAssignedCountToGive] = useState(0);
  
  // 1st year (325), 2nd year (324), 3rd year (323), 4th year (322)
  const [activeYear, setActiveYear] = useState('325'); // Use prefix defaults
  const [assignedActiveYear, setAssignedActiveYear] = useState('325'); // For filtering assigned students
  const [selectedStudents, setSelectedStudents] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return navigate('/login');
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [mentorRes, studentsRes] = await Promise.all([
        apiClient.get('/api/superadmin/mentors-with-students', config),
        apiClient.get('/api/superadmin/unassigned-students', config)
      ]);

      setMentors(mentorRes.data);
      setUnassignedStudents(studentsRes.data);
      
      const assignedRes = await apiClient.get('/api/superadmin/students', config);
      setAllStudents(assignedRes.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) navigate('/login');      
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter students based on active year (first 3 digits of username/rollnumber)
  const filteredStudents = unassignedStudents.filter(s => s.username?.startsWith(activeYear));

  const handleManualAssign = async () => {
    if (!selectedMentor) return alert("Select a mentor first.");
    if (selectedStudents.length === 0) return alert("Select at least one student.");
    
    try {
      const token = localStorage.getItem('authToken');
      await apiClient.post('/api/superadmin/assign-students', {
        mentorId: selectedMentor,
        studentIds: selectedStudents
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Success! Assigned ${selectedStudents.length} students.`);
      setSelectedStudents([]);
      setAssignedCountToGive(0);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error assigning students");
    }
  };

  const handleRandomAssign = async () => {
    if (!selectedMentor) return alert("Select a mentor first.");
    const count = parseInt(assignedCountToGive);
    if (!count || count <= 0) return alert("Enter valid number of slots.");
    
    if (filteredStudents.length < count) {
       return alert(`Only ${filteredStudents.length} students available in this year. Select fewer.`);
    }

    // Pick 'count' random students from the filtered list
    const shuffled = [...filteredStudents].sort(() => 0.5 - Math.random());
    const selectedList = shuffled.slice(0, count).map(s => s._id);

    try {
      const token = localStorage.getItem('authToken');
      await apiClient.post('/api/superadmin/assign-students', {
        mentorId: selectedMentor,
        studentIds: selectedList
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Successfully distributed ${count} random students to the mentor!`);
      setSelectedStudents([]);
      setAssignedCountToGive(0);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error assigning students");
    }
  };
  const handleUnassign = async (studentId) => {
    if (!window.confirm('Are you sure you want to unassign this student?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await apiClient.post('/api/superadmin/unassign-students', {
        studentIds: [studentId]
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Student unassigned successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error unassigning student');
    }
  };
  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(s => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Mentor Allocation (HOD)</Typography>
      <Button onClick={() => navigate('/superadmin/dashboard')} variant="outlined" sx={{ mb: 2 }}>Back to Dashboard</Button>

      <Grid container spacing={3}>
        {/* Mentor Selection Box */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">1. Select Mentor</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Mentor</InputLabel>
              <Select
                value={selectedMentor}
                label="Mentor"
                onChange={(e) => setSelectedMentor(e.target.value)}
              >
                {mentors.map(m => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.username} (Assigned: {m.assignedStudentsCount})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1">Random Assignment Options</Typography>
              <TextField 
                fullWidth 
                type="number" 
                label="Slots / No. of students" 
                sx={{ mt: 2 }}
                value={assignedCountToGive}
                onChange={(e) => setAssignedCountToGive(e.target.value)}
              />
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={handleRandomAssign}
              >
                Random Assign {assignedCountToGive || 0} Students
              </Button>
            </Box>

            {/* Show Assigned Students for selected mentor */}
            {selectedMentor && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" color="success.main" gutterBottom>
                  Currently Assigned Students:
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                  <Button size="small" variant={assignedActiveYear === '325' ? 'contained' : 'outlined'} onClick={() => setAssignedActiveYear('325')}>1st Year</Button>
                  <Button size="small" variant={assignedActiveYear === '324' ? 'contained' : 'outlined'} onClick={() => setAssignedActiveYear('324')}>2nd Year</Button>
                  <Button size="small" variant={assignedActiveYear === '323' ? 'contained' : 'outlined'} onClick={() => setAssignedActiveYear('323')}>3rd Year</Button>
                  <Button size="small" variant={assignedActiveYear === '322' ? 'contained' : 'outlined'} onClick={() => setAssignedActiveYear('322')}>4th Year</Button>
                </Box>

                {(() => {
                   const mentorStudents = allStudents.filter(s => s.assignedMentor === selectedMentor);
                   const filteredMentorStudents = mentorStudents.filter(s => s.username?.startsWith(assignedActiveYear));
                   return (
                     <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                           {filteredMentorStudents.length} students assigned in this year (Total: {mentorStudents.length})
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Roll No.</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredMentorStudents.map(student => (
                                <TableRow key={student._id}>
                                  <TableCell>{student.username}</TableCell>
                                  <TableCell align="right">
                                    <Button 
                                      size="small" 
                                      color="error" 
                                      onClick={() => handleUnassign(student._id)}
                                    >
                                      Unassign
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {filteredMentorStudents.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={2} align="center">No students assigned for this year</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                     </>
                   )
                })()}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">2. Select Student Pool</Typography>

            <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
              <Button variant={activeYear === '325' ? 'contained' : 'outlined'} onClick={() => setActiveYear('325')}>1st Year</Button>
              <Button variant={activeYear === '324' ? 'contained' : 'outlined'} onClick={() => setActiveYear('324')}>2nd Year</Button>
              <Button variant={activeYear === '323' ? 'contained' : 'outlined'} onClick={() => setActiveYear('323')}>3rd Year</Button>
              <Button variant={activeYear === '322' ? 'contained' : 'outlined'} onClick={() => setActiveYear('322')}>4th Year</Button>
            </Box>

            <Typography variant="subtitle1" color="primary">
              Unassigned Students in this Year: {filteredStudents.length}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 1 }}>
              <Typography variant="body2">Select specific students or use the random assign on the left.</Typography>
              <Button 
                 variant="contained" 
                 color="primary" 
                 onClick={handleManualAssign}
                 disabled={selectedStudents.length === 0}
              >
                Manual Assign ({selectedStudents.length})
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        onChange={(e) => {
                          if(e.target.checked) setSelectedStudents(filteredStudents.map(s => s._id));
                          else setSelectedStudents([]);
                        }}
                      />
                    </TableCell>
                    <TableCell>Roll Number (Username)</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student._id}>
                      <TableCell padding="checkbox">
                        <Checkbox 
                           checked={selectedStudents.includes(student._id)}
                           onChange={() => handleSelectStudent(student._id)}
                        />
                      </TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.email}</TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                       <TableCell colSpan={3} align="center">No unassigned students left for this year.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentorAllocation;