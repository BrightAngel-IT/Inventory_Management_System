const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Inventory System' },
    tagline: { type: String, default: 'Excellence in Management' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { type: String, default: '' }, // URL or path to logo
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Company || mongoose.model('Company', companySchema);