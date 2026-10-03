const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    agentType: {
      type: String,
      enum: [
        'teacher',
        'examiner',
        'debugger',
        'coach',
        'research',
        'mentor'
      ],
      required: true,
      index: true
    },

    title: {
      type: String,
      default: 'New Chat',
      trim: true
    },

    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true
        },

        content: {
          type: String,
          required: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);