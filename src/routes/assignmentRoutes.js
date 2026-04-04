const express = require('express');
const router = express.Router();
const { 
  createAssignment, 
  updateAssignment, 
  updateStatus, 
  deleteAssignment, 
  getAssignments, 
  getAssignmentById 
} = require('../controllers/assignmentController');
const { auth, checkRole } = require('../middleware/auth');

// All assignment routes require authentication
router.use(auth);

// Get assignments
router.get('/', getAssignments);

// Get single assignment
router.get('/:id', getAssignmentById);

// Teacher-only routes
router.post('/', checkRole('teacher'), createAssignment);
router.put('/:id', checkRole('teacher'), updateAssignment);
router.patch('/:id/status', checkRole('teacher'), updateStatus);
router.put('/:id/status', checkRole('teacher'), updateStatus); // Fallback to PUT
router.delete('/:id', checkRole('teacher'), deleteAssignment);

module.exports = router;
