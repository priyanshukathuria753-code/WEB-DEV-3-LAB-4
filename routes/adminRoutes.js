// routes/adminRoutes.js - routes only an ADMIN can use (RBAC)
const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const checkLogin = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const router = express.Router();

// 1st checkLogin (are you logged in?), 2nd checkRole (are you an admin?)
router.use(checkLogin, checkRole('admin'));

// GET /api/admin/users - list all users
router.get('/users', async function (req, res) {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/notes - list everybody's notes
router.get('/notes', async function (req, res) {
  try {
    const notes = await Note.find().populate('owner', 'username email');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
