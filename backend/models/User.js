const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, // plain text 6-digit PIN
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
