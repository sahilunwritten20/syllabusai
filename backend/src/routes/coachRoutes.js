const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { dailyPlan, motivate } = require('../controllers/coachController');

router.post('/plan', protect, dailyPlan);
router.get('/motivate', protect, motivate);

module.exports = router;