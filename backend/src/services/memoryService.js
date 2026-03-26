const ChatMessage = require('../models/ChatMessage');

// Save message to MongoDB
const saveMessage = async (userId, agentType, role, content, metadata = {}) => {
  try {
    const message = await ChatMessage.create({
      userId,
      agentType,
      role,
      content,
      metadata
    });
    return message;
  } catch (error) {
    console.error('Memory save error:', error);
  }
};

// Get last N messages for context
const getRecentMessages = async (userId, agentType, limit = 10) => {
  try {
    const messages = await ChatMessage.find({ userId, agentType })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return messages.reverse();
  } catch (error) {
    console.error('Memory fetch error:', error);
    return [];
  }
};

// Get full chat history
const getChatHistory = async (userId, agentType, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const messages = await ChatMessage.find({ userId, agentType })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return messages.reverse();
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
};

// Build context string for AI
const buildContext = async (userId, agentType) => {
  const messages = await getRecentMessages(userId, agentType, 10);
  if (messages.length === 0) return '';

  const context = messages.map(m =>
    `${m.role === 'user' ? 'Student' : 'AI'}: ${m.content}`
  ).join('\n');

  return `Previous conversation:\n${context}\n\n`;
};

// Clear chat history
const clearHistory = async (userId, agentType) => {
  await ChatMessage.deleteMany({ userId, agentType });
};

module.exports = {
  saveMessage,
  getRecentMessages,
  getChatHistory,
  buildContext,
  clearHistory
};