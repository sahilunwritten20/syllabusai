const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  pro: { price: 29900, name: 'Pro Plan', duration: 30 },
  college: { price: 999900, name: 'College Plan', duration: 30 }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const options = {
      amount: PLANS[plan].price,
      currency: 'INR',
      receipt: `receipt_${req.user.userId}_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        plan: plan
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      plan,
      amount: PLANS[plan].price,
      name: PLANS[plan].name
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Activate subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].duration);

    const features = {
      pro: { maxSyllabusUploads: 10, maxAIMessages: 1000, voiceEnabled: true, allAgents: true },
      college: { maxSyllabusUploads: 999, maxAIMessages: 99999, voiceEnabled: true, allAgents: true }
    };

    await Subscription.findOneAndUpdate(
      { userId: req.user.userId },
      {
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        features: features[plan],
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `🎉 ${PLANS[plan].name} activated successfully!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subscription
const getSubscription = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.userId });
    if (!sub) {
      sub = await Subscription.create({
        userId: req.user.userId,
        plan: 'free',
        features: { maxSyllabusUploads: 1, maxAIMessages: 50, voiceEnabled: false, allAgents: false }
      });
    }
    res.status(200).json({ success: true, subscription: sub, plans: PLANS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getSubscription };