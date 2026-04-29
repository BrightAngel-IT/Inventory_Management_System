const express = require('express');
const router = express.Router();
const { getUnpaidInvoices } = require('../services/paymentAllocationService');

router.get('/:customerId', async (req, res, next) => {
  try {
    const invoices = await getUnpaidInvoices(req.params.customerId);
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
