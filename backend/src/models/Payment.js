const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentNo: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    paymentDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'CHEQUE', 'CREDIT_NOTE'],
      required: true,
    },
    chequeNumber: { type: String, default: null },
    allocations: [
      {
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerInvoice', required: true },
        allocatedAmount: { type: Number, required: true, min: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);