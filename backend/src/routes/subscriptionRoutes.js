const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMySubscription, upgradePlan } = require('../controllers/subscriptionController');

router.get('/', protect, getMySubscription);
router.post('/upgrade', protect, upgradePlan);

module.exports = router;