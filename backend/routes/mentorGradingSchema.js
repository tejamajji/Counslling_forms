const express = require('express');
const mongoose = require('mongoose');
const MentorGrading = require('../models/MentorGradingSchema');
const router = express.Router();

// POST: Create or update Mentor Grading
router.post('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const gradingData = req.body;

    // Check if the grading already exists for the given email
    let mentorGrading = await MentorGrading.findOne({ email });

    if (mentorGrading) {
      // Update the existing grading
      mentorGrading.grading = gradingData.grading || mentorGrading.grading;
      mentorGrading.remarks = gradingData.remarks || mentorGrading.remarks;
      mentorGrading.placement = gradingData.placement || mentorGrading.placement;
      mentorGrading.higherEducation = gradingData.higherEducation || mentorGrading.higherEducation;
      mentorGrading.initials = gradingData.initials || mentorGrading.initials;

      await mentorGrading.save();
      return res.status(200).json(mentorGrading);
    } else {
      // Create new grading entry if it doesn't exist
      mentorGrading = new MentorGrading({
        email,
        grading: gradingData.grading,
        remarks: gradingData.remarks,
        placement: gradingData.placement,
        higherEducation: gradingData.higherEducation,
        initials: gradingData.initials,
      });

      await mentorGrading.save();
      return res.status(201).json(mentorGrading);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error in saving grading data', error });
  }
});

// GET: Get Mentor Grading for a specific student
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const mentorGrading = await MentorGrading.findOne({ email });

    if (!mentorGrading) {
      return res.status(404).json({ message: 'Mentor grading not found' });
    }

    return res.status(200).json(mentorGrading);
  } catch (error) {
    return res.status(500).json({ message: 'Error in fetching grading data', error });
  }
});

// PUT: Update specific grading details for a student
router.put('/:email/:semester/:subject', async (req, res) => {
    try {
      const { email, semester, subject } = req.params;
      const updatedGrades = req.body.grading;  // Assuming the grades come inside a 'grading' field
  
      // Check if updatedGrades is an array of numbers
      if (!Array.isArray(updatedGrades) || !updatedGrades.every(grade => typeof grade === 'number')) {
        return res.status(400).json({ message: 'Grades must be an array of numbers' });
      }
  
      const mentorGrading = await MentorGrading.findOne({ email });
  
      if (!mentorGrading) {
        return res.status(404).json({ message: 'Mentor grading not found' });
      }
  
      const gradingField = subject; // e.g., communicationSkills
  
      // Check if the grading field exists
      if (!mentorGrading.grading[gradingField]) {
        return res.status(404).json({ message: 'Subject not found in grading data' });
      }
  
      // Ensure the semester is within bounds (1-indexed)
      if (semester < 1 || semester > mentorGrading.grading[gradingField].length) {
        return res.status(400).json({ message: 'Invalid semester number' });
      }
  
      // Update the grade for the given semester and subject
      mentorGrading.grading[gradingField][semester - 1] = updatedGrades[0]; // Update with the first grade in the array
  
      await mentorGrading.save();
      return res.status(200).json(mentorGrading);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating grading data', error });
    }
  });
  
// DELETE: Delete grading data for a specific student
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const mentorGrading = await MentorGrading.findOneAndDelete({ email });

    if (!mentorGrading) {
      return res.status(404).json({ message: 'Mentor grading not found' });
    }

    return res.status(200).json({ message: 'Grading data deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error in deleting grading data', error });
  }
});

module.exports = router;
