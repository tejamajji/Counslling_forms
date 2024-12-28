const express = require('express');
const router = express.Router();
const MarksController = require('../controllers/marksController'); // Import controller

router.post('/:semester', MarksController.addOrUpdateMarks);
router.get('/:semester/:email', MarksController.getMarksForStudent);
router.get('/:semester', MarksController.getAllMarksForSemester);
router.delete('/:semester/:email', MarksController.deleteMarks);
router.put('/:semester/:email/subjects/:subjectName', MarksController.updateSubjectMarks);

module.exports = router;
