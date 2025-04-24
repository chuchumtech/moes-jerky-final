const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const DeliveryDate = require('../models/DeliveryDate');

// GET /api/admin/dashboard
router.get('/', async (req, res) => {
  try {
    // Get the next delivery date
    const nextDate = await DeliveryDate.findOne({}, {}, { sort: { date: 1 } });
    if (!nextDate) return res.json({ nextDate: null, orderCount: 0, itemCounts: {} });
    // Find all orders for that date (deliveryDate stored as string)
    const orders = await Order.find({ deliveryDate: nextDate._id.toString() });
    // Count items
    const itemCounts = {};
    orders.forEach(order => {
      (order.cartItems || []).forEach(item => {
        if (!itemCounts[item.name]) itemCounts[item.name] = 0;
        itemCounts[item.name] += item.quantity;
      });
    });
    res.json({ nextDate, orderCount: orders.length, itemCounts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

module.exports = router;
