const express = require('express');
const router = express.Router();
const { 
  createPaymentWithAllocations, 
  getPaymentDetails,
  getUnpaidInvoices 
} = require('../services/paymentAllocationService');
const Payment = require('../models/Payment');

router.get('/', async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const filter = customerId ? { customerId } : {};
    const payments = await Payment.find(filter)
      .populate('customerId')
      .populate('allocations.invoiceId')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payment = await createPaymentWithAllocations(req.body);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const payment = await getPaymentDetails(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
