const express = require('express');
const router = express.Router();
const DeliveryDate = require('../models/DeliveryDate');

// GET /api/deliverydates
router.get('/', async (req, res) => {
  try {
    const dates = await DeliveryDate.find({});
    console.log('Fetched delivery dates:', dates);
    res.json(dates);
  } catch (err) {
    console.error('Error fetching delivery dates:', err);
    res.status(500).json({ error: 'Failed to fetch delivery dates' });
  }
});

module.exports = router;
