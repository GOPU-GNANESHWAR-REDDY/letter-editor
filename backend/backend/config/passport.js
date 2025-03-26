const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
      accessType: 'offline', // This is needed for Drive API
      prompt: 'consent', // Forces Google to show the consent screen every time
    },
    async (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken; // Store access token in the profile
      return done(null, profile);
    }
  )
);

// Serialize user info into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user info from session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

