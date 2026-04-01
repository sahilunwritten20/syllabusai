const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { webSearch, runCode } = require('../controllers/toolsController');

router.post('/search', protect, webSearch);
router.post('/execute', protect, runCode);

module.exports = router;