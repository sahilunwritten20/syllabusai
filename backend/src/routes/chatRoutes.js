const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const checkUsage = require('../middleware/checkUsage'); // ✅ USE THIS
const {
  sendMessage,
  getHistory,
  clearChat
} = require('../controllers/chatController');

// ✅ APPLY USAGE LIMIT HERE
router.post('/message', protect, checkUsage('ai'), sendMessage);

router.get('/history/:agentType', protect, getHistory);

router.delete('/clear/:agentType', protect, clearChat);

module.exports = router;