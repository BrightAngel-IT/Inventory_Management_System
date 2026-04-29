const express = require('express');

const { requireAuth, requireRole } = require('../middleware/auth');
const { getProducts, saveProduct, deleteProduct } = require('../services/store');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const products = await getProducts({
      query: req.query.q,
      category: req.query.category,
      lowStockOnly: req.query.lowStock === 'true',
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const product = await saveProduct(req.body);
    res.status(201).json({ product, message: 'Product created successfully.' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const product = await saveProduct({ ...req.body, _id: req.params.id });
    res.json({ product, message: 'Product updated successfully.' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
