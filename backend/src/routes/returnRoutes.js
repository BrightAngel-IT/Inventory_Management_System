const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createReturn, getReturns } = require('../services/store');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const returns = await getReturns(req.query);
    res.json(returns);
  } catch (error) {
    console.error('Return Fetch Error:', error);
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const returnDoc = await createReturn({
      ...req.body,
      processedBy: req.user._id
    });
    res.status(201).json(returnDoc);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
