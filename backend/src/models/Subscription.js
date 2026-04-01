const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },

  usage: {
    messagesUsed: { type: Number, default: 0 },
    syllabusUploads: { type: Number, default: 0 }
  },

  limits: {
    messages: { type: Number, default: 50 },
    uploads: { type: Number, default: 1 }
  },

  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  },
paymentId: { 
    type: String 
},
orderId:{
     type: String 
    },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);