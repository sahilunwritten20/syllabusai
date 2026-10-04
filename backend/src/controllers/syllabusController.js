const fs = require('fs');
const pdfParse = require('pdf-parse');

const Syllabus = require('../models/Syllabus');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PLANS = require('../config/plans');

const { analyzeSyllabus } = require('../agents/syllabusAgent');


// ✅ Upload + Analyze Syllabus
const uploadSyllabus = async (req, res) => {
  let filePath = null;

  try {
    // ✅ Check file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    filePath = req.file.path;

    // 🔥 Get user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔥 Get subscription
    let sub = await Subscription.findOne({
      userId: req.user.userId
    });

    // ✅ Auto-create FREE subscription for new users
    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        status: 'active',
        features: PLANS.free.features
      });
    }

    // 🔥 CHECK UPLOAD LIMIT
    if (user.syllabusUploadsUsed >= sub.features.maxSyllabusUploads) {
      return res.status(403).json({
        success: false,
        message: '🚫 Upload limit reached. Upgrade your plan 🚀'
      });
    }

    // ✅ Read PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const syllabusText = pdfData.text;

    if (!syllabusText || syllabusText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'PDF appears to be empty or unreadable'
      });
    }

    console.log('📄 PDF read successfully, sending to AI...');

    // ✅ AI Analyze
    const analyzed = await analyzeSyllabus(syllabusText);

    console.log(
      '🤖 AI analyzed syllabus:',
      analyzed.branch,
      analyzed.semester
    );

    // ✅ Delete old syllabus
    await Syllabus.findOneAndDelete({
      userId: req.user.userId
    });

    // ✅ Save new syllabus
    const syllabus = await Syllabus.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      branch: analyzed.branch,
      semester: analyzed.semester,
      subjects: analyzed.subjects,
      totalTopics: analyzed.totalTopics,
      estimatedHours: analyzed.estimatedHours,
      isActive: true
    });

    // ✅ Update user info + increment usage
    user.syllabusUploaded = true;
    user.branch = analyzed.branch;
    user.semester = analyzed.semester;
    user.syllabusUploadsUsed += 1;

    await user.save();

    // ✅ Delete file safely
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(201).json({
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
          totalTopics: s.units.reduce(
            (acc, u) => acc + u.topics.length,
            0
          )
        }))
      }
    });

  } catch (error) {
    console.error('Syllabus upload error:', error);

    return res.status(500).json({
      success: false,
      message: 'Upload failed. Please try again.'
    });

  } finally {
    // 🔥 Always delete file (even on error)
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
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

    const syllabus = await Syllabus.findOne({
      userId: req.user.userId
    });

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    const subject = syllabus.subjects.id(subjectId);
    const unit = subject.units.id(unitId);
    const topic = unit.topics.id(topicId);

    topic.isCompleted = true;
    topic.completedAt = new Date();

    let totalTopics = 0;
    let completedTopics = 0;

    syllabus.subjects.forEach(sub => {
      sub.units.forEach(u => {
        u.topics.forEach(t => {
          totalTopics++;

          if (t.isCompleted) {
            completedTopics++;
          }
        });
      });

      const subTotal = sub.units.reduce(
        (a, u) => a + u.topics.length,
        0
      );

      const subDone = sub.units.reduce(
        (a, u) =>
          a + u.topics.filter(t => t.isCompleted).length,
        0
      );

      sub.progress = subTotal > 0
        ? Math.round((subDone / subTotal) * 100)
        : 0;
    });

    syllabus.completedTopics = completedTopics;

    syllabus.overallProgress = totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

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


module.exports = {
  uploadSyllabus,
  getMySyllabus,
  markTopicComplete
};
