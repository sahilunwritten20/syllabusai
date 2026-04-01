const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  createApiKey,
  getMyApiKeys,
  deleteApiKey
} = require('../controllers/apiKeyController');

router.post('/', protect, createApiKey);
router.get('/', protect, getMyApiKeys);
router.delete('/:id', protect, deleteApiKey);

module.exports = router;