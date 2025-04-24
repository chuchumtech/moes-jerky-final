const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// GET /api/admin/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users (add new admin)
router.post('/', async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin || pin.length !== 6) return res.status(400).json({ error: 'Invalid input' });
    const newUser = new User({ username, pin });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// PUT /api/admin/users/:id (edit username or reset PIN)
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.pin) {
      if (updates.pin.length !== 6) return res.status(400).json({ error: 'Invalid PIN' });
      updates.pinHash = await bcrypt.hash(updates.pin, 10);
      delete updates.pin;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
