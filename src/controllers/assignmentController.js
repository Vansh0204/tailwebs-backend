const { assignments, submissions } = require('../models/store');

// Create a new assignment (Teacher only)
const createAssignment = (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !description || !dueDate) {
    return res.status(400).json({ message: 'Title, description, and due date are required' });
  }

  // Get teacher's subject
  const { users } = require('../models/store');
  const teacher = users.find(u => u.id === req.user.id);
  const teacherSubject = teacher ? teacher.subject : null;

  const newAssignment = {
    id: assignments.length + 1,
    title,
    description,
    dueDate,
    status: 'Draft',
    teacherId: req.user.id,
    subject: teacherSubject, // Inherit teacher's subject
    createdAt: new Date().toISOString()
  };

  assignments.push(newAssignment);
  req.app.get('io').emit('assignments-changed');
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

  req.app.get('io').emit('assignments-changed');
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

  req.app.get('io').emit('assignments-changed');
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
  req.app.get('io').emit('assignments-changed');
  res.json({ message: 'Assignment deleted successfully' });
};

// Get assignments
const { users } = require('../models/store');

const getAssignments = (req, res) => {
  const { users, assignments, submissions } = require('../models/store'); // Always get freshest reference
  const currentUser = users.find(u => u.id === req.user.id);
  
  // 1. Calculate submissions per assignment for analytics
  const assignmentsWithTeacher = assignments.map(a => {
    const teacher = users.find(u => u.id === a.teacherId);
    
    // Count submissions for this assignment
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === a.id);
    const submissionCount = assignmentSubmissions.length;

    // Fallback logic: If teacher missing (due to restart), check if it belongs to current requester
    let teacherName = 'Unknown Teacher';
    if (teacher) {
      teacherName = teacher.name;
    } else if (a.teacherId === req.user.id) {
      teacherName = req.user.name;
    }

    return {
      ...a,
      teacherName,
      submissionCount
    };
  });

  // 2. Filter based on role
  let filteredAssignments = [];
  if (req.user.role === 'teacher') {
    // Teachers see their OWN assignments OR those with the same SUBJECT
    filteredAssignments = assignmentsWithTeacher.filter(a => 
      a.teacherId === req.user.id || (a.subject && a.subject === currentUser.subject)
    );
  } else {
    // Students only see published assignments
    filteredAssignments = assignmentsWithTeacher.filter(a => a.status === 'Published' || a.status === 'Completed');
  }

  // 3. Analytics Meta (for dashboard cards)
  const meta = {
    total: filteredAssignments.length,
    published: filteredAssignments.filter(a => a.status === 'Published').length,
    drafts: filteredAssignments.filter(a => a.status === 'Draft').length,
    totalSubmissions: filteredAssignments.reduce((acc, curr) => acc + (curr.submissionCount || 0), 0)
  };

  // 4. Pagination Logic
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  // If page/limit are provided, use them. Otherwise, return the FULL list for the new "Dual-View" frontend.
  let results = filteredAssignments;
  if (page && limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    results = filteredAssignments.slice(startIndex, endIndex);
  }

  res.json({
    assignments: results,
    meta,
    pagination: {
      currentPage: page || 1,
      totalPages: limit ? Math.ceil(filteredAssignments.length / limit) : 1,
      totalItems: filteredAssignments.length,
      limit: limit || filteredAssignments.length
    }
  });
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
