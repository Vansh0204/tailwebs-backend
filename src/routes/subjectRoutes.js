const express = require('express');
const router = express.Router();
const { getSubjects, addSubject } = require('../controllers/subjectController');
const { auth } = require('../middleware/auth');

router.get('/', getSubjects);
router.post('/', auth, addSubject);

module.exports = router;
