const jwt = require('jsonwebtoken');
const { users } = require('../models/store');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`Login failed: Email ${email} not found.`);
      return res.status(400).json({ message: 'User with this email does not exist. Please sign up first.' });
    }

    // For now, let's just use a simple match for the assessment portal
    if (password !== user.password) {
      console.log(`Login failed: Incorrect password for ${email}.`);
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      subject: user.subject
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '24h'
    });

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        subject: user.subject
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const signup = async (req, res) => {
  const { name, email, password, role, subject } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role === 'teacher' && !subject) {
      return res.status(400).json({ message: 'Subject is required for teachers' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log(`Signup failed: User ${email} already exists.`);
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    console.log(`Creating new user: ${email} (${role})`);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password, // In a real app, hash this with bcrypt
      role,
      subject: role === 'teacher' ? subject : null
    };

    users.push(newUser);

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subject: newUser.subject
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateProfile = async (req, res) => {
  const { name, subject } = req.body;
  const userId = req.user.id;

  try {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (subject && user.role === 'teacher') user.subject = subject;

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { login, signup, updateProfile };
