const fs = require('fs');
const pdfParse = require('pdf-parse');
const Syllabus = require('../models/Syllabus');
const User = require('../models/User');
const { analyzeSyllabus } = require('../agents/syllabusAgent');

// ✅ Upload + Analyze Syllabus
const uploadSyllabus = async (req, res) => {
  try {
    // Check file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    // Read PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const syllabusText = pdfData.text;

    if (!syllabusText || syllabusText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'PDF appears to be empty or unreadable'
      });
    }

    console.log('📄 PDF read successfully, sending to AI...');

    // Send to AI Agent
    const analyzed = await analyzeSyllabus(syllabusText);

    console.log('🤖 AI analyzed syllabus:', analyzed.branch, analyzed.semester);

    // Delete any existing syllabus for this user
    await Syllabus.findOneAndDelete({ userId: req.user.userId });

    // Save to database
    const syllabus = await Syllabus.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      branch: analyzed.branch,
      semester: analyzed.semester,
      subjects: analyzed.subjects,
      totalTopics: analyzed.totalTopics,
      estimatedHours: analyzed.estimatedHours
    });

    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      syllabusUploaded: true,
      branch: analyzed.branch,
      semester: analyzed.semester
    });

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: '🎯 Syllabus analyzed successfully!',
      syllabus: {
        id: syllabus._id,
        branch: syllabus.branch,
        semester: syllabus.semester,
        totalSubjects: syllabus.subjects.length,
        totalTopics: syllabus.totalTopics,
        estimatedHours: syllabus.estimatedHours,
        subjects: syllabus.subjects.map(s => ({
          name: s.name,
          totalTopics: s.units.reduce((acc, u) => acc + u.topics.length, 0)
        }))
      }
    });

  } catch (error) {
    console.error('Syllabus upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Get My Syllabus
const getMySyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findOne({
      userId: req.user.userId,
      isActive: true
    });

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'No syllabus found. Please upload one.'
      });
    }

    res.status(200).json({
      success: true,
      syllabus
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Mark Topic Complete
const markTopicComplete = async (req, res) => {
  try {
    const { subjectId, unitId, topicId } = req.params;

    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    // Find and update topic
    const subject = syllabus.subjects.id(subjectId);
    const unit = subject.units.id(unitId);
    const topic = unit.topics.id(topicId);

    topic.isCompleted = true;
    topic.completedAt = new Date();

    // Recalculate progress
    let totalTopics = 0;
    let completedTopics = 0;

    syllabus.subjects.forEach(sub => {
      sub.units.forEach(u => {
        u.topics.forEach(t => {
          totalTopics++;
          if (t.isCompleted) completedTopics++;
        });
      });
      // Update subject progress
      const subTotal = sub.units.reduce((a, u) => a + u.topics.length, 0);
      const subDone = sub.units.reduce((a, u) =>
        a + u.topics.filter(t => t.isCompleted).length, 0);
      sub.progress = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;
    });

    syllabus.completedTopics = completedTopics;
    syllabus.overallProgress = Math.round((completedTopics / totalTopics) * 100);

    await syllabus.save();

    res.status(200).json({
      success: true,
      message: '✅ Topic marked complete!',
      overallProgress: syllabus.overallProgress,
      completedTopics: syllabus.completedTopics,
      totalTopics: syllabus.totalTopics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { uploadSyllabus, getMySyllabus, markTopicComplete };