const Groq = require('groq-sdk');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Syllabus = require('../models/Syllabus');
const ChatSession = require('../models/ChatSession');
const PLANS = require('../config/plans');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ==========================================
// SEND MESSAGE
// ==========================================
const sendMessage = async (req, res) => {
  try {
    const {
      message,
      agentType,
      sessionId
    } = req.body;

    if (!message || !agentType) {
      return res.status(400).json({
        success: false,
        message: 'Message and agentType required'
      });
    }

    // --------------------------------------
    // USER
    // --------------------------------------
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // --------------------------------------
    // SUBSCRIPTION
    // --------------------------------------
    let sub = await Subscription.findOne({
      userId: req.user.userId
    });

    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        status: 'active',
        features: PLANS.free.features
      });
    }

    // --------------------------------------
    // SYLLABUS
    // --------------------------------------
    const syllabus = await Syllabus.findOne({
      userId: req.user.userId
    });

    const branch = syllabus?.branch || 'General';
    const semester = syllabus?.semester || 1;

    // --------------------------------------
    // FIND OR CREATE SESSION
    // --------------------------------------
    let session;

    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        userId: req.user.userId,
        agentType
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }
    } else {
      session = await ChatSession.create({
        userId: req.user.userId,
        agentType,
        title: message.substring(0, 50),
        messages: []
      });
    }

    // --------------------------------------
    // BUILD CONTEXT FROM THIS SESSION ONLY
    // --------------------------------------
    const previousMessages = session.messages
      .slice(-20)
      .map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

    // --------------------------------------
    // SYSTEM PROMPTS
    // --------------------------------------
    const systemPrompts = {
      teacher: `You are a teacher for ${branch} semester ${semester}.`,
      examiner: `You are an examiner for ${branch} students.`,
      debugger: `You fix code and explain programming problems.`,
      coach: `You motivate ${user.name} and help them stay on track.`,
      research: `You are a research assistant who explains topics deeply.`,
      mentor: `You guide students about their careers.`
    };

    // --------------------------------------
    // SAVE USER MESSAGE IN SESSION
    // --------------------------------------
    session.messages.push({
      role: 'user',
      content: message,
      createdAt: new Date()
    });

    await session.save();

    // --------------------------------------
    // GROQ
    // --------------------------------------
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',

      messages: [
        {
          role: 'system',
          content:
            systemPrompts[agentType] ||
            systemPrompts.teacher
        },

        ...previousMessages,

        {
          role: 'user',
          content: message
        }
      ]
    });

    const aiResponse =
      response.choices[0].message.content;

    // --------------------------------------
    // SAVE AI MESSAGE
    // --------------------------------------
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      createdAt: new Date()
    });

    // Update title using first user message
    const firstUserMessage = session.messages.find(
      (msg) => msg.role === 'user'
    );

    if (firstUserMessage) {
      session.title =
        firstUserMessage.content.substring(0, 50);
    }

    await session.save();

    // --------------------------------------
    // INCREMENT AI USAGE
    // --------------------------------------
    user.aiMessagesUsed += 1;
    await user.save();

    return res.json({
      success: true,
      message: aiResponse,
      sessionId: session._id,
      title: session.title
    });

  } catch (err) {
    console.error('Chat error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


// ==========================================
// GET ALL CHAT SESSIONS
// ==========================================
const getHistory = async (req, res) => {
  try {
    const { agentType } = req.params;

    const sessions = await ChatSession.find({
      userId: req.user.userId,
      agentType
    })
      .sort({ updatedAt: -1 })
      .select('_id title agentType createdAt updatedAt');

    return res.json({
      success: true,
      sessions
    });

  } catch (err) {
    console.error('Get history error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to load chat history'
    });
  }
};


// ==========================================
// GET ONE CHAT SESSION
// ==========================================
const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    return res.json({
      success: true,
      session
    });

  } catch (err) {
    console.error('Get session error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to load chat'
    });
  }
};


// ==========================================
// CREATE NEW CHAT
// ==========================================
const createSession = async (req, res) => {
  try {
    const { agentType } = req.body;

    if (!agentType) {
      return res.status(400).json({
        success: false,
        message: 'agentType required'
      });
    }

    const session = await ChatSession.create({
      userId: req.user.userId,
      agentType,
      title: 'New Chat',
      messages: []
    });

    return res.status(201).json({
      success: true,
      session
    });

  } catch (err) {
    console.error('Create session error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
};


// ==========================================
// DELETE ONE CHAT
// ==========================================
const deleteSession = async (req, res) => {
  try {
    const deleted = await ChatSession.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    return res.json({
      success: true,
      message: 'Chat deleted'
    });

  } catch (err) {
    console.error('Delete session error:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete chat'
    });
  }
};


module.exports = {
  sendMessage,
  getHistory,
  getSession,
  createSession,
  deleteSession
};