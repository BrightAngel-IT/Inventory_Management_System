const express = require('express');

const { requireAuth, requireRole } = require('../middleware/auth');
const { getSalesReport } = require('../services/store');

const router = express.Router();

router.get('/sales', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const range = req.query.range || 'weekly';
    const report = await getSalesReport(range);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
