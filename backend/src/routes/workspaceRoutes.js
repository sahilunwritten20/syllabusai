const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createWorkspace, getMyWorkspaces, addMember } = require('../controllers/workspaceController');

router.post('/', protect, createWorkspace);
router.get('/', protect, getMyWorkspaces);
router.post('/:id/members', protect, addMember);

module.exports = router;