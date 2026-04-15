const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // ✅ IMPORTANT (NOT 465)
  secure: false, // ✅ MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SyllabusAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your Password',
    html: `
      <h2>Hi ${userName}</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetURL}" style="
        background:#3b82f6;
        color:white;
        padding:12px 20px;
        border-radius:8px;
        text-decoration:none;
        display:inline-block;
      ">
        Reset Password
      </a>
      <p>This link expires in 15 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };