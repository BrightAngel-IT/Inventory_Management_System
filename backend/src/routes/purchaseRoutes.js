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
  try {
    const { supplier, products, total, date } = req.body;
    
    // 1. Create Purchase Record
    const purchase = new Purchase({ supplier, products, total, date });
    await purchase.save();

    // 2. Update Inventory (Increment quantityInStock)
    const Product = require('../models/Product');
    const updatePromises = products.map(item => 
      Product.findByIdAndUpdate(item.product, {
        $inc: { quantityInStock: item.quantity }
      })
    );
    await Promise.all(updatePromises);

    // 3. Create Supplier Invoice
    await SupplierInvoice.create({
      invoiceNo: `PUR-${Date.now()}`,
      supplierId: supplier,
      date: date || new Date(),
      totalAmount: total,
      balanceAmount: total,
      status: 'UNPAID'
    });

    res.status(201).json(purchase);
  } catch (err) {
    console.error('Purchase creation error:', err);
    res.status(500).json({ message: 'Critical failure during procurement processing.' });
  }
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
