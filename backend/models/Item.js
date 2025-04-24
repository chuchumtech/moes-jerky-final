const mongoose = require('mongoose');

// Use a loose schema to match your existing 'items' collection
const itemSchema = new mongoose.Schema({}, { collection: 'items', strict: false });

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
