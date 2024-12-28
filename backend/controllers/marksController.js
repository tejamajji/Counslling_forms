const Semester = require('../models/Marks'); // Assuming you have a Semester model

exports.addOrUpdateMarks = async (req, res) => {
  const { semester } = req.params;
  const { email, cgpa, subjects } = req.body;

  try {
    let semesterRecord = await Semester.findOne({ email, semester });
    if (semesterRecord) {
      semesterRecord.cgpa = cgpa;
      semesterRecord.subjects = subjects;
      await semesterRecord.save();
      return res.status(200).json({ message: `Marks updated for Semester ${semester}` });
    } else {
      const newSemesterRecord = new Semester({ email, semester, cgpa, subjects });
      await newSemesterRecord.save();
      return res.status(201).json({ message: `Marks added for Semester ${semester}` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMarksForStudent = async (req, res) => {
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
};

exports.getAllMarksForSemester = async (req, res) => {
  const { semester } = req.params;

  try {
    const allMarks = await Semester.find({ semester });
    return res.status(200).json(allMarks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteMarks = async (req, res) => {
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
};

exports.updateSubjectMarks = async (req, res) => {
  const { semester, email, subjectName } = req.params;
  const { mid1, mid2, average, grade } = req.body;

  try {
    const semesterRecord = await Semester.findOne({ email, semester });

    if (!semesterRecord) {
      return res.status(404).json({ error: `No record found for ${email} in Semester ${semester}` });
    }

    const subject = semesterRecord.subjects.find((subj) => subj.subject === subjectName);
    if (subject) {
      subject.mid1 = mid1;
      subject.mid2 = mid2;
      subject.average = average;
      subject.grade = grade;
    } else {
      semesterRecord.subjects.push({ subject: subjectName, mid1, mid2, average, grade });
    }
    await semesterRecord.save();
    return res.status(200).json({ message: 'Subject marks updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
