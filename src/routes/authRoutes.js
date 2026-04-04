const express = require('express');
const router = express.Router();
const { login, signup, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/login', login);
router.post('/signup', signup);
router.put('/profile', auth, updateProfile);

module.exports = router;
