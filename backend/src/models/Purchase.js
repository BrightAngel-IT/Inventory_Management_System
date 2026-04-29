// Purchase model
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  date: { type: Date, default: Date.now },
  total: Number
});

module.exports = mongoose.model('Purchase', purchaseSchema);