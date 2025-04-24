// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true, unique: true },
  orderStatus: { type: String, default: 'processing' },
}, { collection: 'orders', strict: false });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
