// Supplier model
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  address: String,
  email: String,
  phone: String
});

module.exports = mongoose.model('Supplier', supplierSchema);