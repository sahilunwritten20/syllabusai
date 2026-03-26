const { getDailyPlan, getMotivation } = require('../agents/coachAgent');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');

const dailyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });

    if (!syllabus) {
      return res.status(404).json({ success: false, message: 'Please upload syllabus first' });
    }

    console.log(`📈 Coach Agent creating plan for ${user.name}`);
    const plan = await getDailyPlan(
      syllabus,
      syllabus.completedTopics,
      syllabus.totalTopics,
      user.streak,
      req.body.examDate
    );

    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const motivate = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const progress = syllabus ? Math.round((syllabus.completedTopics / syllabus.totalTopics) * 100) : 0;
    const weakSubjects = syllabus ? syllabus.subjects.filter(s => s.progress < 30).map(s => s.name) : [];

    const message = await getMotivation(user.name, user.streak, progress, weakSubjects);
    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { dailyPlan, motivate };