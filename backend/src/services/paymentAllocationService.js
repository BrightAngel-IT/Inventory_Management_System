const mongoose = require('mongoose');
const CustomerInvoice = require('../models/CustomerInvoice');
const Payment = require('../models/Payment');

async function getUnpaidInvoices(customerId) {
  return await CustomerInvoice.find({
    customerId,
    status: { $in: ['UNPAID', 'PARTIAL'] },
  }).sort({ date: 1 });
}

async function createPaymentWithAllocations(paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerId,
      paymentDate,
      totalAmount,
      paymentMethod,
      chequeNumber,
      allocations,
    } = paymentData;

    // Validation
    if (paymentMethod === 'CHEQUE' && !chequeNumber) {
      throw new Error('Cheque number is required for CHEQUE payments.');
    }

    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
    if (totalAllocated > totalAmount) {
      throw new Error('Total allocated amount cannot exceed payment total amount.');
    }

    // 1. Create Payment
    const paymentNo = `PAY-${Date.now()}`;
    const payment = new Payment({
      paymentNo,
      customerId,
      paymentDate,
      totalAmount,
      paymentMethod,
      chequeNumber,
      allocations,
    });

    await payment.save({ session });

    // 2. Update Invoices
    for (const alloc of allocations) {
      const invoice = await CustomerInvoice.findById(alloc.invoiceId).session(session);
      if (!invoice) {
        throw new Error(`Invoice ${alloc.invoiceId} not found.`);
      }

      if (alloc.allocatedAmount > invoice.balanceAmount) {
        throw new Error(`Cannot allocate more than balance for invoice ${invoice.invoiceNo}.`);
      }

      invoice.balanceAmount = Number((invoice.balanceAmount - alloc.allocatedAmount).toFixed(2));
      
      if (invoice.balanceAmount === 0) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIAL';
      }

      await invoice.save({ session });
    }

    await session.commitTransaction();
    return payment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function getPaymentDetails(paymentId) {
  return await Payment.findById(paymentId)
    .populate('customerId')
    .populate('allocations.invoiceId');
}

module.exports = {
  getUnpaidInvoices,
  createPaymentWithAllocations,
  getPaymentDetails,
};
