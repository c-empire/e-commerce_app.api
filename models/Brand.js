const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brandName: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Brand', brandSchema);
