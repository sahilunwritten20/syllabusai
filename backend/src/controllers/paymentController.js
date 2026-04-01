const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const PLANS = require('../config/plans');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan] || plan === 'free') {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const order = await razorpay.orders.create({
      amount: PLANS[plan].price,
      currency: 'INR',
      receipt: `receipt_${req.user.userId}_${Date.now()}`,
      notes: { userId: req.user.userId, plan }
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      plan,
      amount: PLANS[plan].price,
      name: PLANS[plan].name
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].duration);

    await Subscription.findOneAndUpdate(
      { userId: req.user.userId },
      {
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        features: PLANS[plan].features,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `🎉 ${PLANS[plan].name} activated!`
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment };