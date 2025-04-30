const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  // Add other fields as needed
}, { collection: 'items', strict: false });

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
