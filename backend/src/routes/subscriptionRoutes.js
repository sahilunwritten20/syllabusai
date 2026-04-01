const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { getMySubscription } = require('../controllers/subscriptionController');

// ✅ Only this route
router.get('/', protect, getMySubscription);

module.exports = router;