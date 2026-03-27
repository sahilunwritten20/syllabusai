const express = require('express');
const router = express.Router();
const { signup, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('../config/passport');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const User = require('../models/User');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const accessToken = generateAccessToken(req.user._id, req.user.role);
      const refreshToken = generateRefreshToken(req.user._id);

      await User.findByIdAndUpdate(req.user._id, { refreshToken });

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&user=${JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      })}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;