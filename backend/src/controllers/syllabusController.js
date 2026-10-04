
const fs = require('fs');
const pdfParse = require('pdf-parse');

const Syllabus = require('../models/Syllabus');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PLANS = require('../config/plans');

const { analyzeSyllabus } = require('../agents/syllabusAgent');


// ============================================================
// ✅ TRANSFORM AI SUBJECT DATA
// ============================================================

const transformSubjects = (subjects) => {
  return (subjects || []).map(subject => ({
    ...subject,

    units: (subject.units || []).map(unit => ({
      ...unit,

      topics: (unit.topics || []).map(topic => {

        // If topic is a string, convert it to an object
        if (typeof topic === 'string') {
          return {
            name: topic,
            isCompleted: false
          };
        }

        // If topic is already an object
        return {
          ...topic,
          name: topic.name || '',
          isCompleted: topic.isCompleted || false
        };
      })
    }))
  }));
};


// ============================================================
// ✅ UPLOAD + ANALYZE SYLLABUS
// ============================================================

const uploadSyllabus = async (req, res) => {
  let filePath = null;

  try {

    // ========================================================
    // ✅ CHECK FILE UPLOADED
    // ========================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    filePath = req.file.path;


    // ========================================================
    // 🔥 GET USER
    // ========================================================

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }


    // ========================================================
    // 🔥 GET SUBSCRIPTION
    // ========================================================

    let sub = await Subscription.findOne({
      userId: req.user.userId
    });


    // ========================================================
    // ✅ AUTO-CREATE FREE PLAN FOR NEW USERS
    // ========================================================

    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        status: 'active',
        features: PLANS.free.features
      });
    }


    // ========================================================
    // 🔥 CHECK UPLOAD LIMIT
    // ========================================================

    if (user.syllabusUploadsUsed >= sub.features.maxSyllabusUploads) {
      return res.status(403).json({
        success: false,
        message: '🚫 Upload limit reached. Upgrade your plan 🚀'
      });
    }


    // ========================================================
    // ✅ READ PDF
    // ========================================================

    const pdfBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(pdfBuffer);

    const syllabusText = pdfData.text;


    // ========================================================
    // ✅ CHECK PDF CONTENT
    // ========================================================

    if (!syllabusText || syllabusText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'PDF appears to be empty or unreadable'
      });
    }


    console.log(
      '📄 PDF read successfully, sending to AI...'
    );


    // ========================================================
    // 🤖 AI ANALYZE SYLLABUS
    // ========================================================

    const analyzed = await analyzeSyllabus(syllabusText);


    console.log(
      '🤖 AI analyzed syllabus:',
      analyzed.branch,
      analyzed.semester
    );


    // ========================================================
    // 🔍 VALIDATE AI RESPONSE
    // ========================================================

    if (!analyzed || !Array.isArray(analyzed.subjects)) {
      return res.status(500).json({
        success: false,
        message: 'AI returned invalid syllabus data'
      });
    }


    // ========================================================
    // 🗑️ DELETE OLD SYLLABUS
    // ========================================================

    await Syllabus.findOneAndDelete({
      userId: req.user.userId
    });


    // ========================================================
    // 🔄 TRANSFORM AI SUBJECT DATA
    // ========================================================

    const transformedSubjects = transformSubjects(
      analyzed.subjects
    );


    // ========================================================
    // 💾 SAVE NEW SYLLABUS
    // ========================================================

    const syllabus = await Syllabus.create({

      userId: req.user.userId,

      fileName: req.file.originalname,

      branch: analyzed.branch,

      semester: analyzed.semester,

      // 🔥 IMPORTANT:
      // Save transformed subjects
      subjects: transformedSubjects,

      totalTopics: analyzed.totalTopics,

      estimatedHours: analyzed.estimatedHours,

      isActive: true
    });


    // ========================================================
    // 👤 UPDATE USER INFORMATION
    // ========================================================

    user.syllabusUploaded = true;

    user.branch = analyzed.branch;

    user.semester = analyzed.semester;

    user.syllabusUploadsUsed += 1;


    await user.save();


    // ========================================================
    // 🗑️ DELETE UPLOADED FILE
    // ========================================================

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }


    // ========================================================
    // ✅ SUCCESS RESPONSE
    // ========================================================

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

    console.error(
      'Syllabus upload error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Upload failed. Please try again.'

    });

  } finally {

    // ========================================================
    // 🔥 ALWAYS DELETE FILE
    // ========================================================

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }

  }
};


// ============================================================
// ✅ GET MY SYLLABUS
// ============================================================

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


    return res.status(200).json({

      success: true,

      syllabus

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// ============================================================
// ✅ MARK TOPIC COMPLETE
// ============================================================

const markTopicComplete = async (req, res) => {

  try {

    const {
      subjectId,
      unitId,
      topicId
    } = req.params;


    // ========================================================
    // 🔍 FIND SYLLABUS
    // ========================================================

    const syllabus = await Syllabus.findOne({

      userId: req.user.userId

    });


    if (!syllabus) {

      return res.status(404).json({

        success: false,

        message: 'Syllabus not found'

      });

    }


    // ========================================================
    // 🔍 FIND SUBJECT
    // ========================================================

    const subject = syllabus.subjects.id(
      subjectId
    );

    if (!subject) {

      return res.status(404).json({

        success: false,

        message: 'Subject not found'

      });

    }


    // ========================================================
    // 🔍 FIND UNIT
    // ========================================================

    const unit = subject.units.id(
      unitId
    );

    if (!unit) {

      return res.status(404).json({

        success: false,

        message: 'Unit not found'

      });

    }


    // ========================================================
    // 🔍 FIND TOPIC
    // ========================================================

    const topic = unit.topics.id(
      topicId
    );

    if (!topic) {

      return res.status(404).json({

        success: false,

        message: 'Topic not found'

      });

    }


    // ========================================================
    // ✅ MARK TOPIC COMPLETE
    // ========================================================

    topic.isCompleted = true;

    topic.completedAt = new Date();


    // ========================================================
    // 📊 CALCULATE PROGRESS
    // ========================================================

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


      // ======================================================
      // 📊 SUBJECT PROGRESS
      // ======================================================

      const subTotal = sub.units.reduce(

        (a, u) =>
          a + u.topics.length,

        0

      );


      const subDone = sub.units.reduce(

        (a, u) =>

          a +
          u.topics.filter(
            t => t.isCompleted
          ).length,

        0

      );


      sub.progress = subTotal > 0

        ? Math.round(
            (subDone / subTotal) * 100
          )

        : 0;

    });


    // ========================================================
    // 📊 OVERALL PROGRESS
    // ========================================================

    syllabus.completedTopics =
      completedTopics;


    syllabus.overallProgress =
      totalTopics > 0

        ? Math.round(
            (completedTopics / totalTopics) * 100
          )

        : 0;


    // ========================================================
    // 💾 SAVE
    // ========================================================

    await syllabus.save();


    // ========================================================
    // ✅ RESPONSE
    // ========================================================

    return res.status(200).json({

      success: true,

      message: '✅ Topic marked complete!',

      overallProgress:
        syllabus.overallProgress,

      completedTopics:
        syllabus.completedTopics,

      totalTopics:
        syllabus.totalTopics

    });

  } catch (error) {

    console.error(
      'Mark topic complete error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// ============================================================
// 📦 EXPORT CONTROLLERS
// ============================================================

module.exports = {

  uploadSyllabus,

  getMySyllabus,

  markTopicComplete

};
