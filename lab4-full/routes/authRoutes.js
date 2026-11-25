// routes/authRoutes.js - signup, login, profile
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const checkLogin = require('../middleware/authMiddleware');
const appEvents = require('../events/eventEmitter');

const router = express.Router();

// ---------- POST /api/auth/signup ----------
router.post('/signup', async function (req, res) {
  try {
    const { username, email, password } = req.body;

    // 1. check all fields are given
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    // 2. check the email is not already used
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 3. hash the password (10 = salt rounds). NEVER save the plain password!
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. the server decides the role (the client can never choose "admin")
    let role = 'user';
    if (email === process.env.ADMIN_EMAIL) {
      role = 'admin';
    }

    // 5. save the user
    const user = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: role
    });

    appEvents.emit('userRegistered', user.username);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------- POST /api/auth/login ----------
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // 1. find the user
    const user = await User.findOne({ email: email });
    if (!user) {
      appEvents.emit('loginFailed', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. compare the typed password with the saved hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      appEvents.emit('loginFailed', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. create a JWT token valid for 1 hour
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    appEvents.emit('userLoggedIn', user.username);

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------- GET /api/auth/profile (PROTECTED ROUTE) ----------
// checkLogin runs first. If there is no valid token, the request stops there.
router.get('/profile', checkLogin, async function (req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');  // hide the password
    res.json({ message: 'This is a protected route', user: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
