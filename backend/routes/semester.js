const express = require('express');
const Marks = require('../models/Semester'); // Unified Marks model
const router = express.Router();

// Create or Update All Semester Details for a Student
router.post('/', async (req, res) => {
  const { email, subjects } = req.body;

  try {
    // Check if a record already exists for the student
    let marksRecord = await Marks.findOne({ email });

    if (marksRecord) {
      // Update the existing record
      marksRecord.semesters = subjects;
      await marksRecord.save();
      return res.status(200).json({ message: 'Marks updated successfully.' });
    } else {
      // Create a new record
      const newMarksRecord = new Marks({ email, semesters: subjects });
      await newMarksRecord.save();
      return res.status(201).json({ message: 'Marks added successfully.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Marks for a Specific Semester
router.get('/:email/:semester', async (req, res) => {
  const { email, semester } = req.params;

  try {
    const marksRecord = await Marks.findOne({ email });

    if (!marksRecord) {
      return res.status(404).json({ error: `No marks found for ${email}.` });
    }

    const semesterDetails = marksRecord.semesters.find(
      (sem) => sem.semester === parseInt(semester)
    );

    if (!semesterDetails) {
      return res.status(404).json({ error: `No marks found for Semester ${semester}.` });
    }

    return res.status(200).json(semesterDetails);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Marks for a Specific Subject in a Semester
router.put('/:email/:semester/subject/:subjectName', async (req, res) => {
  const { email, semester, subjectName } = req.params;
  const { mid1, mid2, ext } = req.body;

  try {
    const marksRecord = await Marks.findOne({ email });

    if (!marksRecord) {
      return res.status(404).json({ error: `No record found for ${email}.` });
    }

    const semesterDetails = marksRecord.semesters.find(
      (sem) => sem.semester === parseInt(semester)
    );

    if (!semesterDetails) {
      return res.status(404).json({ error: `No marks found for Semester ${semester}.` });
    }

    const subject = semesterDetails.subjects.find((subj) => subj.subject === subjectName);
    if (subject) {
      subject.mid1 = mid1;
      subject.mid2 = mid2;
      subject.ext = ext;
    } else {
      semesterDetails.subjects.push({ subject: subjectName, mid1, mid2, ext });
    }

    await marksRecord.save();
    return res.status(200).json({ message: 'Subject marks updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Marks for a Specific Semester
router.delete('/:email/:semester', async (req, res) => {
  const { email, semester } = req.params;

  try {
    const marksRecord = await Marks.findOne({ email });

    if (!marksRecord) {
      return res.status(404).json({ error: `No record found for ${email}.` });
    }

    marksRecord.semesters = marksRecord.semesters.filter(
      (sem) => sem.semester !== parseInt(semester)
    );

    await marksRecord.save();
    return res.status(200).json({ message: `Semester ${semester} marks deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
