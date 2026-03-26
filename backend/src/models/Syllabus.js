const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }
});

const unitSchema = new mongoose.Schema({
  unitNumber: { type: Number },
  title: { type: String },
  topics: [topicSchema],
  isCompleted: { type: Boolean, default: false }
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: '' },
  units: [unitSchema],
  progress: { type: Number, default: 0 }
});

const syllabusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: { type: String },
  branch: { type: String },
  semester: { type: Number },
  subjects: [subjectSchema],
  totalTopics: { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);