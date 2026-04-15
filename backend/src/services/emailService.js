const nodemailer = require('nodemailer');

// ✅ FINAL FIXED TRANSPORTER
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  // ✅ Fix timeouts
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  // ✅ Fix IPv6 issue
  family: 4,

  // ✅ Debug logs (optional but useful)
  logger: true,
  debug: true
});

// ✅ Verify connection (VERY IMPORTANT)
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email server error:', error);
  } else {
    console.log('✅ Email server is ready');
  }
});

// ✅ Send Email Function
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SyllabusAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your Password',
    html: `
      <div style="font-family: Arial; padding:20px;">
        <h2>Reset Password</h2>
        <p>Hello ${userName},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetURL}" style="color:blue;">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };