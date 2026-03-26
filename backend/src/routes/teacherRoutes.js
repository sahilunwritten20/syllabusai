const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { teach } = require('../controllers/teacherController');

router.post('/teach', protect, teach);

module.exports = router;