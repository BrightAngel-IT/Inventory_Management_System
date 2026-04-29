const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// CRUD routes for Location
router.get('/', async (req, res) => {
  const locations = await Location.find();
  res.json(locations);
});

router.post('/', async (req, res) => {
  const location = new Location(req.body);
  await location.save();
  res.json(location);
});

router.put('/:id', async (req, res) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(location);
});

router.delete('/:id', async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
