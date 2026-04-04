const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const { users } = require('./models/store');

const app = express();

// 1. Manual CORS Preflight & Header Fix (MUST be at the absolute top)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 Hours

  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  next();
});

// 2. Health/Status Check (Base URL)
const statusHandler = (req, res) => {
  res.json({ 
    status: 'Ready',
    version: '2.8 (Profile API Active)',
    userCount: users.length,
    timestamp: new Date().toISOString(),
    endpoints: ['/api/auth/profile [PUT]', '/api/subjects [GET/POST]']
  });
};

app.get('/', statusHandler);
app.get('/status', statusHandler);
app.get('/api/status', statusHandler);

// 3. Remove Standard CORS Middleware (Using manual override instead)
// app.use(cors({ origin: true, credentials: true })); 

app.use(morgan('dev'));
app.use(express.json());

// manual handler moved to top

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/subjects', subjectRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
