const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  key: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  lastUsed: { type: Date },
  rateLimit: { type: Number, default: 100 }
}, { timestamps: true });

apiKeySchema.pre('save', function(next) {
  if (!this.key) {
    this.key = 'sai_' + crypto.randomBytes(32).toString('hex');
  }
  next();
});

module.exports = mongoose.model('ApiKey', apiKeySchema);