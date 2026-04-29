const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const SupplierInvoice = require('../models/SupplierInvoice');

// CRUD routes for Purchase
router.get('/', async (req, res) => {
  const purchases = await Purchase.find().populate('supplier').populate('products.product');
  res.json(purchases);
});

router.post('/', async (req, res) => {
  const purchase = new Purchase(req.body);
  await purchase.save();

  // Create Supplier Invoice
  await SupplierInvoice.create({
    invoiceNo: `PUR-${Date.now()}`,
    supplierId: purchase.supplier,
    date: purchase.date || new Date(),
    totalAmount: purchase.total,
    balanceAmount: purchase.total,
    status: 'UNPAID'
  });

  res.json(purchase);
});

router.put('/:id', async (req, res) => {
  const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(purchase);
});

router.delete('/:id', async (req, res) => {
  await Purchase.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
