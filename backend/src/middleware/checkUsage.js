const Subscription = require('../models/Subscription');

const checkUsage = (type) => {
  return async (req, res, next) => {
    try {
      const sub = await Subscription.findOne({ userId: req.user.userId });

      if (!sub) {
        return res.status(403).json({ message: 'No subscription found' });
      }

      // Expiry check
      if (sub.endDate && sub.endDate < new Date()) {
        sub.plan = 'free';
        sub.status = 'expired';
        await sub.save();
      }

      // AI usage
      if (type === 'ai') {
        if (req.user.aiMessagesUsed >= sub.features.maxAIMessages) {
          return res.status(403).json({
            message: 'AI message limit reached. Upgrade 🚀'
          });
        }
      }

      // Upload usage
      if (type === 'upload') {
        if (req.user.syllabusUploadsUsed >= sub.features.maxSyllabusUploads) {
          return res.status(403).json({
            message: 'Upload limit reached. Upgrade 🚀'
          });
        }
      }

      next();

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

module.exports = checkUsage;