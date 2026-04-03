const Subscription = require('../models/Subscription');
const PLANS = require('../config/plans');

const checkUsage = (type) => {
  return async (req, res, next) => {
    try {
      let sub = await Subscription.findOne({ userId: req.user.userId });

      // ✅ AUTO CREATE FREE PLAN
      if (!sub) {
        sub = await Subscription.create({
          userId: req.user.userId,
          plan: 'free',
          status: 'active',
          features: PLANS.free.features
        });
      }

      // ✅ AI LIMIT
      if (type === 'ai') {
        if (req.user.aiMessagesUsed >= sub.features.maxAIMessages) {
          return res.status(403).json({
            success: false,
            message: 'AI limit reached 🚀'
          });
        }
      }

      next();
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };
};

module.exports = checkUsage;