const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 6) return res.status(400).json({ error: 'Invalid PIN' });

  // Check hardcoded super admin
  if (pin === '258022') {
    req.session.admin = true;
    req.session.adminUser = 'Super Admin';
    req.session.lastActive = Date.now();
    return res.json({ success: true, user: 'Super Admin' });
  }

  // Check for user with plain text pin or legacy code
  let foundUser = await User.findOne({ $or: [ { code: pin }, { pin: pin } ] });
  if (!foundUser) return res.status(401).json({ error: 'Incorrect PIN' });
  req.session.admin = true;
  req.session.adminUser = foundUser.username || foundUser.name || 'Admin';
  req.session.lastActive = Date.now();
  res.json({ success: true, user: req.session.adminUser });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// GET /api/admin/me
router.get('/me', (req, res) => {
  if (req.session.admin) {
    req.session.lastActive = Date.now();
    res.json({ admin: true, user: req.session.adminUser });
  } else {
    res.status(401).json({ admin: false });
  }
});

module.exports = router;
