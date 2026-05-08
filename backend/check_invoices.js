
const mongoose = require('mongoose');
// Since we are running from 'backend' folder
const CustomerInvoice = require('./src/models/CustomerInvoice');
const Customer = require('./src/models/Customer');

async function check() {
  const uri = 'mongodb+srv://BrightAngel:Brightangel2026@cluster0.ajpwb6i.mongodb.net/inventory_system?retryWrites=true&w=majority';
  await mongoose.connect(uri);
  const customer = await Customer.findOne({ name: /Saayinath/i });
  if (!customer) {
    console.log('Customer not found');
    process.exit(1);
  }
  console.log('Found customer:', customer.name, customer._id);
  const invoices = await CustomerInvoice.find({ customerId: customer._id });
  console.log(JSON.stringify(invoices, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
