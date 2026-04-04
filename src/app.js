const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { users } = require('./models/store');

const app = express();

// 1. CORS MUST be the first middleware
app.use(cors({
  origin: true, // Reflects the request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Assignment Workflow API is running...');
});

// Health/Status Check
app.get('/api/auth/status', (req, res) => {
  res.json({ 
    status: 'Ready',
    version: '2.1 (Detailed Errors)',
    userCount: users.length,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
