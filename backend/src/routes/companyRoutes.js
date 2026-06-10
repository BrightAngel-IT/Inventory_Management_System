const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getCompany, updateCompany } = require('../services/store');
const upload = require('../middleware/upload');

const router = express.Router();

// Public route to get company info (needed for login page or receipts)
router.get('/', async (req, res, next) => {
  try {
    const company = await getCompany();
    res.json(company);
  } catch (error) {
    next(error);
  }
});

// Admin only route to update company settings
router.post('/', requireAuth, requireRole(['admin']), upload.single('logo'), async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.logo = `/uploads/${req.file.filename}`;
    }
    const company = await updateCompany(payload);
    res.json(company);
  } catch (error) {
    next(error);
  }
});

module.exports = router;