const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissionsByAssignment } = require('../controllers/submissionController');
const { auth, checkRole } = require('../middleware/auth');

// All submission routes require authentication
router.use(auth);

// Submit answer (Student only)
router.post('/', checkRole('student'), createSubmission);

// Get submissions for an assignment (Teacher see all, Student see own)
router.get('/:assignmentId', getSubmissionsByAssignment);

module.exports = router;
