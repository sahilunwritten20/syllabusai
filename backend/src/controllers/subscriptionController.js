const Subscription = require('../models/Subscription');

const PLANS = {
  free: {
    maxSyllabusUploads: 1,
    maxAIMessages: 50,
    voiceEnabled: false,
    allAgents: false,
    price: 0
  },
  pro: {
    maxSyllabusUploads: 10,
    maxAIMessages: 1000,
    voiceEnabled: true,
    allAgents: true,
    price: 299
  },
  college: {
    maxSyllabusUploads: 999,
    maxAIMessages: 99999,
    voiceEnabled: true,
    allAgents: true,
    price: 9999
  }
};

const getMySubscription = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.userId });
    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        features: PLANS.free
      });
    }
    res.status(200).json({ success: true, subscription: sub, plans: PLANS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });
    const sub = await Subscription.findOneAndUpdate(
      { userId: req.user.userId },
      { plan, features: PLANS[plan], status: 'active', endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, subscription: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMySubscription, upgradePlan, PLANS };