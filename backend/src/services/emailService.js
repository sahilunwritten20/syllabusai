const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS not SSL
  requireTLS: true,
  family: 4, // ✅ Force IPv4 — fixes Render IPv6 issue
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SyllabusAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your SyllabusAI password',
    html: `
      <div style="font-family:Inter,-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#07090F;color:#fff;padding:40px 32px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
          <div style="width:32px;height:32px;border-radius:9px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;font-size:16px">⚡</div>
          <span style="font-size:17px;font-weight:700;letter-spacing:-0.03em">SyllabusAI</span>
        </div>

        <h1 style="font-size:22px;font-weight:800;letter-spacing:-0.04em;margin:0 0 8px;color:#fff">Reset your password</h1>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 28px;line-height:1.6">Hi ${userName}, we received a request to reset your password. Click the button below to create a new one.</p>

        <a href="${resetURL}" style="display:inline-block;background:#3B82F6;color:#fff;padding:13px 28px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:24px">
          Reset password
        </a>

        <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0 0 6px">This link expires in <strong style="color:rgba(255,255,255,0.5)">15 minutes</strong>.</p>
        <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0">If you didn't request this, you can safely ignore this email.</p>

        <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07)">
          <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0">SyllabusAI · AI-Powered Learning Platform</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Email server error:', error);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };