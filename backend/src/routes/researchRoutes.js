const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { research, doubt } = require('../controllers/researchController');

router.post('/research', protect, research);
router.post('/doubt', protect, doubt);

module.exports = router;