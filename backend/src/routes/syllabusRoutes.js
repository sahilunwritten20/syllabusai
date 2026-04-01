const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  uploadSyllabus,
  getMySyllabus,
  markTopicComplete
} = require('../controllers/syllabusController');

// ✅ Upload (limit handled inside controller)
router.post('/upload', protect, upload.single('syllabus'), uploadSyllabus);

router.get('/my', protect, getMySyllabus);
router.patch('/complete/:subjectId/:unitId/:topicId', protect, markTopicComplete);

module.exports = router;