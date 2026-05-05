const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema(
  {
    paymentNo: { type: String, required: true, unique: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    paymentDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'CHEQUE', 'CREDIT_NOTE', 'BANK_TRANSFER'],
      required: true,
    },
    chequeNumber: { type: String, default: null },
    allocations: [
      {
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierInvoice', required: true },
        allocatedAmount: { type: Number, required: true, min: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.SupplierPayment || mongoose.model('SupplierPayment', supplierPaymentSchema);
