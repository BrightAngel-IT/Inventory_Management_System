const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { createSale, getRecentSales, getSales } = require('../services/store');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { date, cashierId, query } = req.query;
    const sales = await getSales({ date, cashierId, query });
    res.json({ sales });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const sale = await createSale({
      ...req.body,
      cashier: req.user,
    });

    res.status(201).json({
      sale,
      message: 'Sale completed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
