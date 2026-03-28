const passport = require('passport');

if (process.env.GOOGLE_CLIENT_ID) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const User = require('../models/User');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
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
}

module.exports = passport;