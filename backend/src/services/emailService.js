const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
transporter.verify((error) => {
  if (error) {
    console.log('❌ Email error:', error);
  } else {
    console.log('✅ Email server ready');
  }
});
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SyllabusAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your SyllabusAI Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3b82f6; font-size: 28px; margin-bottom: 8px;">SyllabusAI</h1>
        <h2 style="color: white; font-size: 22px;">Password Reset Request</h2>
        <p style="color: #94a3b8;">Hi ${userName},</p>
        <p style="color: #94a3b8;">We received a request to reset your password. Click the button below to set a new password.</p>
        
        <a href="${resetURL}" style="
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
          margin: 24px 0;
        ">
          🔐 Reset Password
        </a>
        
        <p style="color: #64748b; font-size: 14px;">This link expires in <strong style="color: #f59e0b;">15 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">If you didn't request this, ignore this email. Your password won't change.</p>
        
        <hr style="border-color: #1e293b; margin: 24px 0;">
        <p style="color: #475569; font-size: 12px;">SyllabusAI — Your AI Learning Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };