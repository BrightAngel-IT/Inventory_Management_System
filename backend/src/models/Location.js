// Location model (rack/row/column)
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  rack: { type: String, required: true },
  row: { type: String, required: true },
  column: { type: String, required: true }
});

module.exports = mongoose.model('Location', locationSchema);