const { subjects } = require('../models/store');

const getSubjects = (req, res) => {
  res.json(subjects);
};

const addSubject = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Subject name is required' });
  
  if (!subjects.includes(name)) {
    subjects.push(name);
  }
  
  res.status(201).json(subjects);
};

module.exports = { getSubjects, addSubject };
