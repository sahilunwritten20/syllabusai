const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getQuiz, checkAnswer } = require('../controllers/examinerController');

router.post('/quiz', protect, getQuiz);
router.post('/check', protect, checkAnswer);

module.exports = router;