const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validate');

const {
  sendMessage,
  getHistory,
  getSession,
  createSession,
  deleteSession
} = require('../controllers/chatController');


// ==========================================
// SEND MESSAGE
// ==========================================
router.post(
  '/message',
  protect,
  validateMessage,
  sendMessage
);


// ==========================================
// GET ALL SESSIONS FOR AGENT
// ==========================================
router.get(
  '/history/:agentType',
  protect,
  getHistory
);


// ==========================================
// GET ONE SESSION
// ==========================================
router.get(
  '/session/:sessionId',
  protect,
  getSession
);


// ==========================================
// CREATE NEW SESSION
// ==========================================
router.post(
  '/session',
  protect,
  createSession
);


// ==========================================
// DELETE ONE SESSION
// ==========================================
router.delete(
  '/session/:sessionId',
  protect,
  deleteSession
);


module.exports = router;