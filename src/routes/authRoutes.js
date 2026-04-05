const express = require('express');
const router = express.Router();
const { login, signup, updateProfile, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.get('/me', auth, getMe);
router.post('/login', login);
router.post('/signup', signup);
router.put('/profile', auth, updateProfile);

module.exports = router;
