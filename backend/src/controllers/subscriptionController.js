const Subscription = require('../models/Subscription');
const PLANS = require('../config/plans');

// Get or create subscription
const getMySubscription = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.userId });

    // Create free plan if not exists
    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        features: PLANS.free.features
      });
    }

    // Check expiry
    if (sub.endDate && sub.endDate < new Date()) {
      sub.plan = 'free';
      sub.status = 'expired';
      sub.features = PLANS.free.features;
      await sub.save();
    }

    res.json({ success: true, subscription: sub, plans: PLANS });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMySubscription };