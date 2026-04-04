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
      name: user.name
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
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
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
      role
    };

    users.push(newUser);

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { login, signup };
