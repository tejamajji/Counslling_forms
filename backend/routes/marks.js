const express = require('express');
const Semester = require('../models/Marks'); // Unified Semester model
const router = express.Router();

// Create or Update Marks for a Semester
router.post('/:semester', async (req, res) => {
  const { semester } = req.params;
  const { email, cgpa, subjects } = req.body;

  try {
    // Check if a record already exists for the student in the given semester
    let semesterRecord = await Semester.findOne({ email, semester });
    if (semesterRecord) {
      // Update existing record
      semesterRecord.cgpa = cgpa;
      semesterRecord.subjects = subjects;
      await semesterRecord.save();
      return res.status(200).json({ message: `Marks updated for Semester ${semester}` });
    } else {
      // Create new record
      const newSemesterRecord = new Semester({
        email,
        semester,
        cgpa,
        subjects,
      });
      await newSemesterRecord.save();
      return res.status(201).json({ message: `Marks added for Semester ${semester}` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Marks for a specific semester
router.get('/:semester/:email', async (req, res) => {
  const { semester, email } = req.params;

  try {
    const semesterRecord = await Semester.findOne({ email, semester });

    if (!semesterRecord) {
      return res.status(404).json({ error: `No marks found for ${email} in Semester ${semester}` });
    }
    return res.status(200).json(semesterRecord);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Marks for a Semester
router.get('/:semester', async (req, res) => {
  const { semester } = req.params;

  try {
    const allMarks = await Semester.find({ semester });
    return res.status(200).json(allMarks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Marks for a specific student in a semester
router.delete('/:semester/:email', async (req, res) => {
  const { semester, email } = req.params;

  try {
    const semesterRecord = await Semester.findOneAndDelete({ email, semester });

    if (!semesterRecord) {
      return res.status(404).json({ error: `No marks found for ${email} in Semester ${semester}` });
    }
    return res.status(200).json({ message: `Marks deleted for Semester ${semester}` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Marks for a Subject
router.put('/:semester/:email/subjects/:subjectName', async (req, res) => {
  const { semester, email, subjectName } = req.params;
  const { mid1, mid2, average, grade } = req.body;

  try {
    const semesterRecord = await Semester.findOne({ email, semester });

    if (!semesterRecord) {
      return res.status(404).json({ error: `No record found for ${email} in Semester ${semester}` });
    }

    // Find and update the subject
    const subject = semesterRecord.subjects.find((subj) => subj.subject === subjectName);
    if (subject) {
      subject.mid1 = mid1;
      subject.mid2 = mid2;
      subject.average = average;
      subject.grade = grade;
    } else {
      semesterRecord.subjects.push({
        subject: subjectName,
        mid1,
        mid2,
        average,
        grade,
      });
    }
    await semesterRecord.save();
    return res.status(200).json({ message: 'Subject marks updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
