const Razorpay = require('razorpay');
const crypto = require('crypto');

const Subscription = require('../models/Subscription');
const User = require('../models/User');
const PLANS = require('../config/plans');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ✅ Create Razorpay Order
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    console.log("👉 PLAN RECEIVED:", plan);
    console.log("👉 KEY ID:", process.env.RAZORPAY_KEY_ID);

    // ❌ Prevent invalid / free plan
    if (!PLANS[plan] || plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    console.log("👉 PLAN CONFIG:", PLANS[plan]);

    const order = await razorpay.orders.create({
      amount: PLANS[plan].price, // in paise
      currency: 'INR',
      receipt: `receipt_${req.user.userId}_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        plan
      }
    });

    console.log("✅ ORDER CREATED:", order.id);

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      plan,
      amount: PLANS[plan].price,
      name: PLANS[plan].name
    });

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR FULL:", err);

    return res.status(500).json({
      success: false,
      message: err.message // 👈 IMPORTANT (show real error)
    });
  }
};


// ✅ Verify Payment & Activate Subscription
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan
    } = req.body;

    // 🔒 Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // 🔥 Calculate expiry
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].duration);

    // ✅ Update subscription
    const subscription = await Subscription.findOneAndUpdate(
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

    // 🔥 RESET USAGE AFTER PAYMENT (VERY IMPORTANT)
    await User.findByIdAndUpdate(req.user.userId, {
      aiMessagesUsed: 0,
      syllabusUploadsUsed: 0
    });

    return res.status(200).json({
      success: true,
      message: `🎉 ${PLANS[plan].name} activated successfully!`,
      subscription
    });

  } catch (err) {
    console.error('Payment Verification Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};


module.exports = {
  createOrder,
  verifyPayment
};

