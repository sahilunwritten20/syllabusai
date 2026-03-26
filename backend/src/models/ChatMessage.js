const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentType: {
    type: String,
    enum: ['teacher', 'examiner', 'debugger', 'coach', 'research', 'mentor'],
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    topic: String,
    subject: String,
    tokensUsed: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);