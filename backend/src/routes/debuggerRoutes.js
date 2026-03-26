const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { debug, review } = require('../controllers/debuggerController');

router.post('/debug', protect, debug);
router.post('/review', protect, review);

module.exports = router;