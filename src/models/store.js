const bcrypt = require('bcryptjs');

// In-memory store
const users = [
  {
    id: 1,
    email: 'teacher@tailwebs.com',
    password: '$2a$10$Xm7V/qG9vRzH.Z9YhV5u5eW0S1V0vL0Y0n0n0n0n0n0n0n0n0n0n0', // password
    role: 'teacher',
    name: 'Teacher User'
  },
  {
    id: 2,
    email: 'student@tailwebs.com',
    password: '$2a$10$Xm7V/qG9vRzH.Z9YhV5u5eW0S1V0vL0Y0n0n0n0n0n0n0n0n0n0n0', // password
    role: 'student',
    name: 'Student User'
  }
];

const assignments = [];
const submissions = [];

module.exports = {
  users,
  assignments,
  submissions
};
