const Groq = require('groq-sdk');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');
const PLANS = require('../config/plans');

const {
  saveMessage,
  getChatHistory,
  buildContext,
  clearHistory
} = require('../services/memoryService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { message, agentType } = req.body;

    if (!message || !agentType) {
      return res.status(400).json({
        success: false,
        message: 'Message and agentType required'
      });
    }

    // ✅ USER
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ SUBSCRIPTION (SAFE)
    let sub = await Subscription.findOne({ userId: req.user.userId });

    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        status: 'active',
        features: PLANS.free.features
      });
    }

    // ✅ OPTIONAL SYLLABUS
    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || 'General';
    const semester = syllabus?.semester || 1;

    // ✅ MEMORY
    const context = await buildContext(req.user.userId, agentType);

    await saveMessage(req.user.userId, agentType, 'user', message);

    const systemPrompts = {
      teacher: `You are a teacher for ${branch} semester ${semester}`,
      examiner: `You are an examiner`,
      debugger: `You fix code`,
      coach: `You motivate ${user.name}`,
      research: `You explain deeply`,
      mentor: `You guide careers`
    };

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompts[agentType] },
        {
          role: 'user',
          content: context ? context + message : message
        }
      ]
    });

    const aiResponse = response.choices[0].message.content;

    await saveMessage(req.user.userId, agentType, 'assistant', aiResponse);

    // ✅ INCREMENT ONCE
    user.aiMessagesUsed += 1;
    await user.save();

    return res.json({
      success: true,
      message: aiResponse
    });

  } catch (err) {
    console.error('Chat error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ HISTORY
const getHistory = async (req, res) => {
  const messages = await getChatHistory(
    req.user.userId,
    req.params.agentType
  );

  res.json({ success: true, messages });
};

// ✅ CLEAR
const clearChat = async (req, res) => {
  await clearHistory(req.user.userId, req.params.agentType);
  res.json({ success: true });
};

module.exports = {
  sendMessage,
  getHistory,
  clearChat
};
