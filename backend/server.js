require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const authenticateJWT = require('./middleware/auth');
const { uploadLetterToDrive } = require('./config/googleDrive');
require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Default route
app.get('/', (req, res) => res.send('Backend is running!'));

// Google OAuth Login
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// Google OAuth Callback

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Ensure accessToken is available
    const accessToken = req.user.accessToken;
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token received from Google' });
    }

    // Generate JWT token with access token
    const token = jwt.sign(
      { user: { ...req.user, accessToken } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.redirect(`https://letter-editor-frontend.netlify.app?token=${token}`);
  }
);

// Protected profile route
app.get('/profile', authenticateJWT, (req, res) => res.json(req.user));

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// Save Letter to Google Drive
app.post('/save-letter', authenticateJWT, async (req, res) => {
  const { content } = req.body;
  const accessToken = req.user.user._json.access_token;

  console.log("🔹 Access Token:", accessToken); // Debugging

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const fileUrl = await uploadLetterToDrive(accessToken, content);
    res.json({ message: 'Letter saved successfully!', fileUrl });
  } catch (error) {
    console.error('❌ Google Drive Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to save letter to Google Drive' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

