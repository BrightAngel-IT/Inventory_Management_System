const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// CRUD routes for Customer
router.get('/', async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

router.post('/', async (req, res) => {
  const customer = new Customer(req.body);
  await customer.save();
  res.json(customer);
});

router.put('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(customer);
});

router.delete('/:id', async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
