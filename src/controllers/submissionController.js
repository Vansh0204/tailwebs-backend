const { submissions, assignments, users } = require('../models/store');

// Submit answer (Student only)
const createSubmission = (req, res) => {
  const { assignmentId, answer, file } = req.body;

  if (!assignmentId || !answer) {
    return res.status(400).json({ message: 'Assignment ID and answer are required' });
  }

  // Check if assignment exists and is Published
  const assignment = assignments.find(a => a.id === parseInt(assignmentId));
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  if (assignment.status !== 'Published') {
    return res.status(400).json({ message: 'Submissions are only allowed for Published assignments' });
  }

  // Check if already submitted
  const alreadySubmitted = submissions.some(s => s.assignmentId === parseInt(assignmentId) && s.studentId === req.user.id);
  if (alreadySubmitted) {
    return res.status(400).json({ message: 'You have already submitted an answer for this assignment' });
  }

  const newSubmission = {
    id: submissions.length + 1,
    assignmentId: parseInt(assignmentId),
    studentId: req.user.id,
    studentName: req.user.name,
    answer,
    file: file || null, // Optional file metadata
    submittedAt: new Date().toISOString()
  };

  submissions.push(newSubmission);
  res.status(201).json(newSubmission);
};

// Get submissions (Teacher only)
const getSubmissionsByAssignment = (req, res) => {
  const { assignmentId } = req.params;

  // Teachers see all submissions for an assignment
  if (req.user.role === 'teacher') {
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === parseInt(assignmentId));
    return res.json(assignmentSubmissions);
  } else {
    // Students only see their own submission for an assignment
    const studentSubmission = submissions.find(s => s.assignmentId === parseInt(assignmentId) && s.studentId === req.user.id);
    if (!studentSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    return res.json(studentSubmission);
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByAssignment
};
