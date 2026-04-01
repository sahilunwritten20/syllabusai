const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentType: { type: String, required: true },
  version: { type: Number, default: 1 },
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  performance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Prompt', promptSchema);