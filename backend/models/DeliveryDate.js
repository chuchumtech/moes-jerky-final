const mongoose = require('mongoose');

const DeliveryDateSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g. '2025-04-24'
  label: { type: String }, // e.g. 'Thursday, April 24'
}, { collection: 'deliverydates' });

module.exports = mongoose.model('DeliveryDate', DeliveryDateSchema);
