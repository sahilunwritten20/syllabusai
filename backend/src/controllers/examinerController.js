const { generateQuiz, evaluateAnswer } = require('../agents/examinerAgent');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');

const getQuiz = async (req, res) => {
  try {
    const { topic, subject, difficulty } = req.body;
    if (!topic || !subject) {
      return res.status(400).json({ success: false, message: 'Topic and subject required' });
    }
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || user?.branch || 'Computer Science';

    console.log(`❓ Examiner Agent generating quiz: ${topic}`);
    const quiz = await generateQuiz(topic, subject, branch, difficulty || 'medium');

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkAnswer = async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, topic } = req.body;
    const feedback = await evaluateAnswer(question, userAnswer, correctAnswer, topic);
    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();
    res.status(200).json({ success: true, isCorrect, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuiz, checkAnswer };