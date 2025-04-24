const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');

// GET /api/admin/analytics/orders?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/orders', async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {};
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = new Date(start);
      if (end) query.createdAt.$lte = new Date(end);
    }
    const orders = await Order.find(query);
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    res.json({ count: orders.length, totalRevenue, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/analytics/products
router.get('/products', async (req, res) => {
  try {
    const orders = await Order.find();
    const productCounts = {};
    orders.forEach(order => {
      (order.cartItems || []).forEach(item => {
        if (!productCounts[item.name]) productCounts[item.name] = 0;
        productCounts[item.name] += item.quantity;
      });
    });
    res.json(productCounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

module.exports = router;
