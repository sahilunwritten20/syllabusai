const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, getHistory, clearChat } = require('../controllers/chatController');

router.post('/message', protect, sendMessage);
router.get('/history/:agentType', protect, getHistory);
router.delete('/clear/:agentType', protect, clearChat);

module.exports = router;