const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true
});
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SyllabusAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Password',
    html: `
      <h2>Password Reset</h2>
      <p>Hello ${userName}</p>
      <p>Click below to reset:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>This link expires in 15 minutes</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };