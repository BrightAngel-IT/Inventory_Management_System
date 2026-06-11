const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const { connectDatabase, isDatabaseReady } = require('./src/config/database');
const { demoUsers, demoProducts, buildDemoSales } = require('./src/data/demoData');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Sale = require('./src/models/Sale');
const Company = require('./src/models/Company');

const generateId = () => new mongoose.Types.ObjectId().toString();

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    if (!isDatabaseReady()) {
      console.error('Database connection is not ready. Please check your MONGO_URI.');
      process.exit(1);
    }

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
    ]);

    console.log('Seeding users...');
    const preparedUsers = [];
    for (const user of demoUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      preparedUsers.push({
        ...user,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    const createdUsers = await User.insertMany(preparedUsers);
    console.log(`Seeded ${createdUsers.length} users.`);

    console.log('Seeding products...');
    const preparedProducts = demoProducts.map(p => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const createdProducts = await Product.insertMany(preparedProducts);
    console.log(`Seeded ${createdProducts.length} products.`);

    console.log('Seeding sales...');
    const sales = buildDemoSales(createdProducts, createdUsers);
    const createdSales = await Sale.insertMany(sales);
    console.log(`Seeded ${createdSales.length} sales.`);

    // Also seed a default company if it doesn't exist
    const companyCount = await Company.countDocuments();
    if (companyCount === 0) {
      await Company.create({
        name: 'Inventory System',
        tagline: 'Excellence in Management',
        address: '295, 1/1 Galle Road, Colombo – 06, Sri Lanka',
        phone: '+94 11 234 5678',
        email: 'info@inventorysystem.com',
        watermark: '',
        loyaltyCardCode: 'NILMA-2026-DISC295',
      });
      console.log('Seeded default company profile.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
