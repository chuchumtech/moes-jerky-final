const express = require('express');
const router = express.Router();
const DeliveryDate = require('../models/DeliveryDate');

// GET /api/admin/deliverydates
router.get('/', async (req, res) => {
  try {
    const dates = await DeliveryDate.find().sort({ date: 1 });
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery dates' });
  }
});

// POST /api/admin/deliverydates
router.post('/', async (req, res) => {
  try {
    const newDate = new DeliveryDate(req.body);
    await newDate.save();
    res.status(201).json(newDate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add delivery date' });
  }
});

// PUT /api/admin/deliverydates/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await DeliveryDate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery date' });
  }
});

// DELETE /api/admin/deliverydates/:id
router.delete('/:id', async (req, res) => {
  try {
    await DeliveryDate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete delivery date' });
  }
});

module.exports = router;
