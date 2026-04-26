const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/jwt');

// ==============================
// ✅ SIGNUP
// ==============================
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({ name, email, password, role });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ LOGIN (FIXED)
// ==============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 🔒 Account lock check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minutes`
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.loginAttempts = 0;
        await user.save();

        return res.status(423).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 30 minutes'
        });
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${5 - user.loginAttempts} attempts left`
      });
    }

    // ✅ Reset attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ GET CURRENT USER
// ==============================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ LOGOUT
// ==============================
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      refreshToken: null
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ FORGOT PASSWORD (SECURE)
// ==============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    // 🔐 Hash token before saving
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email!'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

// ==============================
// ✅ RESET PASSWORD (SECURE)
// ==============================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    // 🔥 invalidate sessions
    user.refreshToken = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! Please login again.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Reset failed' });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};