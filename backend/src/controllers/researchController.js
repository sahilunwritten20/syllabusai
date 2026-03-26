const { researchTopic, answerDoubt } = require('../agents/researchAgent');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');

const research = async (req, res) => {
  try {
    const { topic, subject, depth } = req.body;
    if (!topic || !subject) {
      return res.status(400).json({ success: false, message: 'Topic and subject required' });
    }
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || 'Computer Science';

    console.log(`🔍 Research Agent researching: ${topic}`);
    const result = await researchTopic(topic, subject, branch, depth || 'medium');
    res.status(200).json({ success: true, topic, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const doubt = async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question required' });
    }
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || 'Computer Science';
    const semester = syllabus?.semester || 1;

    const answer = await answerDoubt(question, context, branch, semester);
    res.status(200).json({ success: true, question, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { research, doubt };