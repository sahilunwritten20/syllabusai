const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMySubscription } = require('../controllers/subscriptionController');

router.get('/', protect, getMySubscription);

module.exports = router;