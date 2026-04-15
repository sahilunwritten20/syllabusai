const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: 'SyllabusAI <onboarding@resend.dev>',
    to: email,
    subject: 'Reset Password',
    html: `
      <h2>Password Reset</h2>
      <p>Hello ${userName}</p>
      <p>Click below to reset:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>This link expires in 15 minutes</p>
    `
  });
};

module.exports = { sendPasswordResetEmail };