const express = require('express');
const router = express.Router();
const CustomerInvoice = require('../models/CustomerInvoice');

router.get('/', async (req, res) => {
  const invoices = await CustomerInvoice.find().populate('customerId').sort({ date: -1 });
  res.json(invoices);
});

router.get('/customer/:customerId', async (req, res) => {
  const invoices = await CustomerInvoice.find({ customerId: req.params.customerId }).sort({ date: -1 });
  res.json(invoices);
});

module.exports = router;
