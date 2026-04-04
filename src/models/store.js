const bcrypt = require('bcryptjs');

// In-memory store
const users = [
  {
    id: 1,
    email: 'teacher@tailwebs.com',
    password: 'password',
    role: 'teacher',
    name: 'Teacher User',
    subject: 'Maths'
  },
  {
    id: 2,
    email: 'student@tailwebs.com',
    password: 'password',
    role: 'student',
    name: 'Student User'
  }
];

const assignments = [];
const submissions = [];
const subjects = ['Maths', 'Science', 'English', 'History', 'Art'];

module.exports = {
  users,
  assignments,
  submissions,
  subjects
};
