const Subscription = require('../models/Subscription');

const checkMessageLimit = async (req, res, next) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.userId });

    if (!sub) {
      sub = await Subscription.create({ userId: req.user.userId });
    }

    if (sub.usage.messagesUsed >= sub.limits.messages) {
      return res.status(403).json({
        success: false,
        message: 'Message limit reached. Upgrade plan.'
      });
    }

    req.subscription = sub;
    next();

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const incrementMessageUsage = async (req) => {
  if (!req.subscription) return;

  req.subscription.usage.messagesUsed += 1;
  await req.subscription.save();
};

module.exports = { checkMessageLimit, incrementMessageUsage };