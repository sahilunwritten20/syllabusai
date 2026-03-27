const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { speechToText } = require('../controllers/voiceController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/speech-to-text', protect, upload.single('audio'), speechToText);

module.exports = router;