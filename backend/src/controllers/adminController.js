const User = require('../models/User');
const Syllabus = require('../models/Syllabus');
const ChatMessage = require('../models/ChatMessage');

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalSyllabuses = await Syllabus.countDocuments();
    const totalMessages = await ChatMessage.countDocuments();
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt branch semester');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalSyllabuses,
        totalMessages,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password -refreshToken');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Syllabus.findOneAndDelete({ userId: req.params.id });
    await ChatMessage.deleteMany({ userId: req.params.id });
    res.status(200).json({ success: true, message: 'User deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getAllUsers, deleteUser };