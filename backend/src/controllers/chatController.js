
const Groq = require('groq-sdk');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const {
  saveMessage,
  getChatHistory,
  buildContext,
  clearHistory
} = require('../services/memoryService');


// ✅ Send message to any agent
const sendMessage = async (req, res) => {
  try {
    const { message, agentType } = req.body;

    if (!message || !agentType) {
      return res.status(400).json({
        success: false,
        message: 'Message and agentType required'
      });
    }

    // 🔥 Get user + subscription
    const user = await User.findById(req.user.userId);
    const sub = await Subscription.findOne({ userId: req.user.userId });

    if (!user || !sub) {
      return res.status(403).json({
        success: false,
        message: 'User or subscription not found'
      });
    }

    // 🔥 Check AI usage limit
    if (user.aiMessagesUsed >= sub.features.maxAIMessages) {
      return res.status(403).json({
        success: false,
        message: '🚫 AI message limit reached. Upgrade your plan 🚀'
      });
    }

    const syllabus = await Syllabus.findOne({ userId: req.user.userId });
    const branch = syllabus?.branch || 'Computer Science';
    const semester = syllabus?.semester || 1;

    // Get memory context
    const context = await buildContext(req.user.userId, agentType);

    // Save user message
    await saveMessage(req.user.userId, agentType, 'user', message);

    // Agent system prompts
    const systemPrompts = {
      teacher: `You are an expert teacher for ${branch} Semester ${semester} students. You have memory of previous conversations. Be encouraging and explain clearly.`,
      examiner: `You are an examiner for ${branch} students. Generate questions and evaluate answers. Remember previous quiz performance.`,
      debugger: `You are a code debugger for ${branch} students. Help fix and review code. Remember previous code issues discussed.`,
      coach: `You are a motivating academic coach for ${user.name}. Track their progress and motivate them. Remember their goals.`,
      research: `You are a research assistant for ${branch} Semester ${semester}. Answer doubts and provide deep information.`,
      mentor: `You are a career mentor for ${branch} students. Guide them about career paths, skills and opportunities.`
    };

    const systemPrompt = systemPrompts[agentType] || systemPrompts.teacher;

    // 🔥 Call AI
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: context ? `${context}Current message: ${message}` : message
        }
      ]
    });

    const aiResponse = response.choices[0].message.content;

    // Save AI response
    await saveMessage(req.user.userId, agentType, 'assistant', aiResponse);

    // 🔥 Increment usage AFTER success
    user.aiMessagesUsed += 1;
    await user.save();

    res.status(200).json({
      success: true,
      agentType,
      message: aiResponse,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};


// ✅ Get chat history
const getHistory = async (req, res) => {
  try {
    const { agentType } = req.params;
    const { page = 1 } = req.query;

    const messages = await getChatHistory(
      req.user.userId,
      agentType,
      page,
      20
    );

    res.status(200).json({ success: true, messages });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ Clear chat history
const clearChat = async (req, res) => {
  try {
    const { agentType } = req.params;

    await clearHistory(req.user.userId, agentType);

    res.status(200).json({
      success: true,
      message: 'Chat cleared!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  sendMessage,
  getHistory,
  clearChat
};

