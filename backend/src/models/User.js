const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  branch: { type: String, default: '' },
  semester: { type: Number, default: 1 },
  college: { type: String, default: '' },
  learningStyle: { type: String, default: 'theory' },
  goalRole: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  googleId: { type: String },
  refreshToken: { type: String },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  syllabusUploaded: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  if (!this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);