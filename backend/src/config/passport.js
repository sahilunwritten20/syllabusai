const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // Check if email exists
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link Google account
        user.googleId = profile.id;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isEmailVerified: true,
          role: 'student'
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;