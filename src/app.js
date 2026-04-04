const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { users } = require('./models/store');

const app = express();

// 1. Health/Status Check (Base URL)
const statusHandler = (req, res) => {
  res.json({ 
    status: 'Ready',
    version: '2.4 (Base Status Fix)',
    userCount: users.length,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
};

app.get('/', statusHandler);
app.get('/status', statusHandler);
app.get('/api/status', statusHandler);

// 2. CORS MUST be the first middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
