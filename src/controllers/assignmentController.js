const { assignments, submissions } = require('../models/store');

// Create a new assignment (Teacher only)
const createAssignment = (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !description || !dueDate) {
    return res.status(400).json({ message: 'Title, description, and due date are required' });
  }

  const newAssignment = {
    id: assignments.length + 1,
    title,
    description,
    dueDate,
    status: 'Draft',
    teacherId: req.user.id,
    createdAt: new Date().toISOString()
  };

  assignments.push(newAssignment);
  res.status(201).json(newAssignment);
};

// Update an assignment (Teacher only)
const updateAssignment = (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body;

  const index = assignments.findIndex(a => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  // Only editable in Draft mode
  if (assignments[index].status !== 'Draft') {
    return res.status(400).json({ message: 'Only draft assignments can be edited' });
  }

  assignments[index] = {
    ...assignments[index],
    title: title || assignments[index].title,
    description: description || assignments[index].description,
    dueDate: dueDate || assignments[index].dueDate,
    updatedAt: new Date().toISOString()
  };

  res.json(assignments[index]);
};

// Update status (Teacher only)
const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = assignments.findIndex(a => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  const currentStatus = assignments[index].status;

  // Workflow enforcement
  // Draft -> Published
  if (currentStatus === 'Draft' && status === 'Published') {
    assignments[index].status = 'Published';
  } 
  // Published -> Completed (Locked)
  else if (currentStatus === 'Published' && status === 'Completed') {
    assignments[index].status = 'Completed';
  } else {
    return res.status(400).json({ 
      message: `Invalid status transition from ${currentStatus} to ${status}` 
    });
  }

  res.json(assignments[index]);
};

// Delete assignment (Teacher only, only if Draft)
const deleteAssignment = (req, res) => {
  const { id } = req.params;
  const index = assignments.findIndex(a => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  if (assignments[index].status !== 'Draft') {
    return res.status(400).json({ message: 'Only draft assignments can be deleted' });
  }

  assignments.splice(index, 1);
  res.json({ message: 'Assignment deleted successfully' });
};

// Get assignments
const getAssignments = (req, res) => {
  if (req.user.role === 'teacher') {
    // Teachers see all their assignments
    return res.json(assignments);
  } else {
    // Students only see published assignments
    const publishedAssignments = assignments.filter(a => a.status === 'Published' || a.status === 'Completed');
    return res.json(publishedAssignments);
  }
};

// Get single assignment
const getAssignmentById = (req, res) => {
  const { id } = req.params;
  const assignment = assignments.find(a => a.id === parseInt(id));

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  // Student check: can only see if Published or Completed
  if (req.user.role === 'student' && assignment.status === 'Draft') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(assignment);
};

module.exports = {
  createAssignment,
  updateAssignment,
  updateStatus,
  deleteAssignment,
  getAssignments,
  getAssignmentById
};
