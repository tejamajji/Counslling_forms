const express = require('express');
const Marks = require('../models/Semester'); // Unified Marks model
const router = express.Router();

// Create or Update a Semester for a Student
router.post('/', async (req, res, next) => {
  const { email, semester, subjects } = req.body;

  try {
    let marksRecord = await Marks.findOne({ email });

    if (marksRecord) {
      // Check if semester exists
      let semesterIndex = marksRecord.semesters.findIndex(
        (sem) => sem.semester === parseInt(semester)
      );

      if (semesterIndex !== -1) {
        // Semester exists, update it
        marksRecord.semesters[semesterIndex].subjects = subjects;
      } else {
        // Add new semester
        marksRecord.semesters.push({ semester: parseInt(semester), subjects });
      }

      await marksRecord.save();
      return res.status(200).json({ message: 'Semester marks updated successfully.' });
    } else {
      // Create a new record
      const newMarksRecord = new Marks({
        email,
        semesters: [{ semester: parseInt(semester), subjects }],
      });

      await newMarksRecord.save();
      return res.status(201).json({ message: 'Marks added successfully.' });
    }
  } catch (err) { next(err);
  }
});

// Get Marks for a Specific Semester
router.get('/:email/:semester', async (req, res, next) => {
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
  } catch (err) { next(err);
  }
});

// Update Marks for a Specific Semester
router.put('/:email/:semester', async (req, res, next) => {
  const { email, semester } = req.params;
  const { subjects } = req.body;

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

    // Update only the subjects of the given semester
    semesterDetails.subjects = subjects;
    await marksRecord.save();

    return res.status(200).json({ message: 'Semester marks updated successfully.' });
  } catch (err) { next(err);
  }
});

// Update Marks for a Specific Subject in a Semester
router.put('/:email/:semester/subject/:subjectName', async (req, res, next) => {
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
  } catch (err) { next(err);
  }
});

// Delete Marks for a Specific Semester
router.delete('/:email/:semester', async (req, res, next) => {
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
  } catch (err) { next(err);
  }
});

module.exports = router;
