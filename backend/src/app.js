const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');


const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const saleRoutes = require('./routes/saleRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const customerInvoiceRoutes = require('./routes/customerInvoiceRoutes');
const supplierInvoiceRoutes = require('./routes/supplierInvoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Static serving for images
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      mode: process.env.MONGO_URI ? 'atlas-ready' : 'demo-memory',
      timestamp: new Date().toISOString(),
    });
  });


  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/customer-invoices', customerInvoiceRoutes);
  app.use('/api/supplier-invoices', supplierInvoiceRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/supplier-payments', require('./routes/supplierPaymentRoutes'));
  app.use('/api/users', userRoutes);

  app.use((error, _req, res, _next) => {
    console.error(error);

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Something went wrong.',
    });
  });

  return app;
}

module.exports = {
  createApp,
};
