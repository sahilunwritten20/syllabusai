const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },

  plan: { 
    type: String, 
    enum: ['free', 'pro', 'college'], 
    default: 'free' 
  },

  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'expired'], 
    default: 'active' 
  },

  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },

  features: {
    maxSyllabusUploads: Number,
    maxAIMessages: Number,
    voiceEnabled: Boolean,
    allAgents: Boolean
  },

  paymentId: String,
  orderId: String

}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);