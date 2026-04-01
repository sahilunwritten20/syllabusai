const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { savePrompt, getPromptHistory } = require('../controllers/promptController');

router.post('/', protect, savePrompt);
router.get('/:agentType', protect, getPromptHistory);

module.exports = router;