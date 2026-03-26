const { debugCode, reviewCode } = require('../agents/debuggerAgent');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');

const debug = async (req, res) => {
  try {
    const { code, language, error } = req.body;
    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language required' });
    }
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || 'Computer Science';

    console.log(`🐛 Debugger Agent analyzing ${language} code`);
    const result = await debugCode(code, language, error, branch);
    res.status(200).json({ success: true, language, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const review = async (req, res) => {
  try {
    const { code, language, topic } = req.body;
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || 'Computer Science';

    const result = await reviewCode(code, language, topic, branch);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { debug, review };