const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { requireAuth } = require('../middleware/auth');

// CRUD routes for Customer
router.get('/', requireAuth, async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

router.get('/:id', requireAuth, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  res.json(customer);
});

router.post('/', requireAuth, async (req, res) => {
  const customer = new Customer(req.body);
  await customer.save();
  res.json(customer);
});

router.put('/:id', requireAuth, async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(customer);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(customer);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
