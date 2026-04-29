const express = require('express');
const router = express.Router();
const SupplierInvoice = require('../models/SupplierInvoice');

router.get('/', async (req, res) => {
  const invoices = await SupplierInvoice.find().populate('supplierId').sort({ date: -1 });
  res.json(invoices);
});

router.get('/supplier/:supplierId', async (req, res) => {
  const invoices = await SupplierInvoice.find({ supplierId: req.params.supplierId }).sort({ date: -1 });
  res.json(invoices);
});

module.exports = router;
