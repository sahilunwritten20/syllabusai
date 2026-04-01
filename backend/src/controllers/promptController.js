const Prompt = require('../models/Prompt');

const savePrompt = async (req, res) => {
  try {
    const { agentType, content } = req.body;
    const lastPrompt = await Prompt.findOne({ userId: req.user.userId, agentType })
      .sort({ version: -1 });
    const version = lastPrompt ? lastPrompt.version + 1 : 1;
    await Prompt.updateMany({ userId: req.user.userId, agentType }, { isActive: false });
    const prompt = await Prompt.create({
      userId: req.user.userId, agentType, content, version, isActive: true
    });
    res.status(201).json({ success: true, prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPromptHistory = async (req, res) => {
  try {
    const { agentType } = req.params;
    const prompts = await Prompt.find({ userId: req.user.userId, agentType })
      .sort({ version: -1 });
    res.status(200).json({ success: true, prompts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { savePrompt, getPromptHistory };