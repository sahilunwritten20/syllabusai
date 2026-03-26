const { teachTopic } = require('../agents/teacherAgent');
const Syllabus = require('../models/Syllabus');
const User = require('../models/User');

// ✅ Teach a topic
const teach = async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (!topic || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic and subject'
      });
    }

    // Get user info for personalization
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });

    const branch = syllabus?.branch || user?.branch || 'Computer Science';
    const semester = syllabus?.semester || user?.semester || 1;
    const learningStyle = user?.learningStyle || 'theory';

    console.log(`📚 Teacher Agent teaching: ${topic} to ${user.name}`);

    // Call Teacher Agent
    const explanation = await teachTopic(
      topic,
      subject,
      branch,
      semester,
      learningStyle
    );

    res.status(200).json({
      success: true,
      topic,
      subject,
      branch,
      semester,
      learningStyle,
      explanation
    });

  } catch (error) {
    console.error('Teacher Agent error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { teach };