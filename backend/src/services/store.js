const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { isDatabaseReady } = require('../config/database');
const { buildDemoSales, demoProducts, demoUsers } = require('../data/demoData');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');
const CustomerInvoice = require('../models/CustomerInvoice');
const SupplierInvoice = require('../models/SupplierInvoice');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Return = require('../models/Return');

const memoryStore = {
  ready: false,
  users: [],
  products: [],
  sales: [],
  returns: [],
};

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatCurrencyAmount(value) {
  return Number((value || 0).toFixed(2));
}

function sanitizeUser(user) {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    branch: user.branch,
  };
}

function makeInvoiceNumber() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ];
  const suffix = String(Date.now()).slice(-4);
  return `C-INV-${parts.join('')}-${suffix}`;
}

function getRackLabel(rack) {
  return `R${rack.rowNumber}-C${rack.columnNumber}-S${rack.shelfNumber}`;
}

function sameDay(dateA, dateB) {
  const left = new Date(dateA);
  const right = new Date(dateB);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfWeek(date) {
  const clone = new Date(date);
  const day = (clone.getDay() + 6) % 7;
  clone.setDate(clone.getDate() - day);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function startOfMonth(date) {
  const clone = new Date(date);
  clone.setDate(1);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function startOfYear(date) {
  const clone = new Date(date);
  clone.setMonth(0, 1);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

async function prepareSeedUsers() {
  const prepared = [];

  for (const user of demoUsers) {
    prepared.push({
      _id: generateId(),
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: await bcrypt.hash(user.password, 10),
      role: user.role,
      branch: user.branch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return prepared;
}

function prepareSeedProducts() {
  return demoProducts.map((product) => ({
    _id: generateId(),
    ...clonePlain(product),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

async function seedMemoryStore() {
  if (memoryStore.ready) {
    return;
  }

  const users = await prepareSeedUsers();
  const products = prepareSeedProducts();
  const sales = buildDemoSales(products, users).map((sale) => ({
    _id: generateId(),
    ...sale,
  }));

  memoryStore.users = users;
  memoryStore.products = products;
  memoryStore.sales = sales;
  memoryStore.ready = true;
}

async function seedDatabase() {
  const [userCount, productCount, saleCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Sale.countDocuments(),
  ]);

  if (userCount === 0) {
    const users = await prepareSeedUsers();
    await User.insertMany(users);
  }

  if (productCount === 0) {
    const products = prepareSeedProducts();
    await Product.insertMany(products);
  }

  if (saleCount === 0) {
    const [users, products] = await Promise.all([User.find().lean(), Product.find().lean()]);
    const sales = buildDemoSales(products, users);
    await Sale.insertMany(sales);
  }
}

async function initializeStore() {
  if (isDatabaseReady()) {
    await seedDatabase();
    memoryStore.users = await User.find().lean();
    return;
  }

  await seedMemoryStore();
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || 'inventory-demo-secret',
    { expiresIn: '12h' },
  );
}

async function loginUser(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw createError('Invalid email or password.', 401);
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    throw createError('Invalid email or password.', 401);
  }

  const sanitizedUser = sanitizeUser(user);

  return {
    token: signToken(sanitizedUser),
    user: sanitizedUser,
  };
}

async function findUserByEmail(email) {
  if (isDatabaseReady()) {
    return User.findOne({ email }).lean();
  }

  return memoryStore.users.find((user) => user.email === email) || null;
}

function getUserById(id) {
  const user = memoryStore.users.find((item) => String(item._id) === String(id));
  return user ? sanitizeUser(user) : null;
}

async function getAllUsersForLookup() {
  if (isDatabaseReady()) {
    const users = await User.find().lean();
    memoryStore.users = users;
    return users;
  }

  return memoryStore.users;
}

async function getAllProducts() {
  if (isDatabaseReady()) {
    const products = await Product.find().sort({ name: 1 }).lean();
    return products.map((product) => ({
      ...product,
      _id: String(product._id),
    }));
  }

  return clonePlain(memoryStore.products).sort((left, right) => left.name.localeCompare(right.name));
}

async function getAllSales() {
  if (isDatabaseReady()) {
    const sales = await Sale.find().sort({ createdAt: -1 }).lean();
    
    // Fetch related invoices to get actual balances
    const invoiceNos = sales.map(s => s.invoiceNumber);
    const invoices = await CustomerInvoice.find({ invoiceNo: { $in: invoiceNos } }).lean();
    const invoiceMap = new Map(invoices.map(i => [i.invoiceNo, i]));

    return sales.map((sale) => {
      const inv = invoiceMap.get(sale.invoiceNumber);
      return {
        ...sale,
        _id: String(sale._id),
        balanceAmount: inv ? inv.balanceAmount : (sale.paymentMethod === 'credit' ? sale.total : 0),
        status: inv ? inv.status : (sale.paymentMethod === 'credit' ? 'UNPAID' : 'PAID'),
        items: sale.items.map((item) => ({
          ...item,
          productId: String(item.productId),
        })),
      };
    });
  }

  return clonePlain(memoryStore.sales).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function getProducts(filters = {}) {
  const products = await getAllProducts();

  return products
    .filter((product) => {
      const matchesQuery = filters.query
        ? `${product.name} ${product.sku} ${product.barcode}`
            .toLowerCase()
            .includes(String(filters.query).toLowerCase())
        : true;
      const matchesCategory = filters.category
        ? product.category.toLowerCase() === String(filters.category).toLowerCase()
        : true;
      const matchesStock = filters.lowStockOnly
        ? Number(product.quantityInStock) <= Number(product.reorderLevel)
        : true;

      return matchesQuery && matchesCategory && matchesStock;
    })
    .map((product) => ({
      ...product,
      rackLabel: getRackLabel(product.rack),
    }));
}

async function saveProduct(payload) {
  const productData = {
    name: String(payload.name || '').trim(),
    sku: String(payload.sku || '').trim(),
    barcode: String(payload.barcode || '').trim(),
    category: String(payload.category || '').trim(),
    description: String(payload.description || '').trim(),
    unit: String(payload.unit || 'pcs').trim(),
    price: Number(payload.price || 0),
    costPrice: Number(payload.costPrice || 0),
    loyaltyDiscount: Number(payload.loyaltyDiscount || 0),
    quantityInStock: Number(payload.quantityInStock || 0),
    reorderLevel: Number(payload.reorderLevel || 0),
    rack: {
      rowNumber: Number(payload.rack?.rowNumber || 1),
      columnNumber: Number(payload.rack?.columnNumber || 1),
      shelfNumber: Number(payload.rack?.shelfNumber || 1),
    },
    image: String(payload.image || '').trim(),
  };

  if (!productData.name || !productData.sku || !productData.barcode || !productData.category) {
    throw createError('Name, SKU, barcode, and category are required.');
  }

  if (!productData.image) {
    productData.image =
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" rx="40" fill="#dbeafe"/><text x="72" y="220" font-size="54" font-family="Segoe UI, Arial, sans-serif" fill="#0f172a">${productData.name}</text><text x="72" y="286" font-size="26" font-family="Segoe UI, Arial, sans-serif" fill="#475569">${productData.category}</text></svg>`,
      );
  }

  if (isDatabaseReady()) {
    if (payload._id) {
      const product = await Product.findByIdAndUpdate(payload._id, productData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!product) {
        throw createError('Product not found.', 404);
      }

      return { ...product, _id: String(product._id), rackLabel: getRackLabel(product.rack) };
    }

    const product = await Product.create(productData);
    const plainProduct = product.toObject();
    return {
      ...plainProduct,
      _id: String(plainProduct._id),
      rackLabel: getRackLabel(plainProduct.rack),
    };
  }

  if (payload._id) {
    const index = memoryStore.products.findIndex((product) => String(product._id) === String(payload._id));
    if (index < 0) {
      throw createError('Product not found.', 404);
    }

    memoryStore.products[index] = {
      ...memoryStore.products[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...clonePlain(memoryStore.products[index]),
      rackLabel: getRackLabel(memoryStore.products[index].rack),
    };
  }

  const newProduct = {
    _id: generateId(),
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.products.push(newProduct);

  return {
    ...clonePlain(newProduct),
    rackLabel: getRackLabel(newProduct.rack),
  };
}

async function deleteProduct(productId) {
  if (isDatabaseReady()) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw createError('Product not found.', 404);
    }
    return { success: true };
  }

  const index = memoryStore.products.findIndex((p) => String(p._id) === String(productId));
  if (index < 0) {
    throw createError('Product not found.', 404);
  }

  memoryStore.products.splice(index, 1);
  return { success: true };
}

async function createSale(payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (items.length === 0) {
    throw createError('Add at least one item before checking out.');
  }

  const products = await getAllProducts();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const saleItems = items.map((item) => {
    const product = productMap.get(String(item.productId));

    if (!product) {
      throw createError('One of the selected products was not found.', 404);
    }

    const quantity = Number(item.quantity || 0);

    if (quantity <= 0) {
      throw createError(`Quantity must be greater than zero for ${product.name}.`);
    }

    if (quantity > Number(product.quantityInStock)) {
      throw createError(`Not enough stock for ${product.name}.`);
    }

    const isLoyalty = !!payload.loyaltyCard;
    const regularPrice = Number(product.price || 0);
    const memberPriceInDb = Number(product.loyaltyDiscount || regularPrice);
    
    // POS Page Logic: Loyalty Price is the value in DB (interpreted as member price)
    const effectivePrice = isLoyalty 
      ? Math.max(0, Math.min(regularPrice, memberPriceInDb)) 
      : regularPrice;

    const lineTotal = formatCurrencyAmount(effectivePrice * quantity);

    return {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: effectivePrice, // The actual selling price
      originalPrice: regularPrice, // The base price
      loyaltyDiscount: isLoyalty ? Math.max(0, regularPrice - effectivePrice) : 0,
      quantity,
      lineTotal,
      image: product.image,
      rack: product.rack,
    };
  });

  const subtotal = formatCurrencyAmount(
    saleItems.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const discount = formatCurrencyAmount(Number(payload.discount || 0));
  const tax = 0;
  const total = formatCurrencyAmount(subtotal - discount);

  const salePayload = {
    invoiceNumber: makeInvoiceNumber(),
    customerName: String(payload.customerName || 'Walk-in customer').trim(),
    loyaltyCard: String(payload.loyaltyCard || '').trim(),
    paymentMethod: ['cash', 'card', 'upi', 'bank-transfer', 'credit', 'split'].includes(payload.paymentMethod)
      ? payload.paymentMethod
      : 'cash',
    splitPayments: payload.splitPayments || undefined,
    discount,
    tax,
    subtotal,
    total,
    customerId: payload.customerId || undefined, // Optional customer link
    items: saleItems,
    cashier: {
      userId: payload.cashier._id,
      name: payload.cashier.name,
      email: payload.cashier.email,
    },
    notes: String(payload.notes || '').trim(),
  };

  if (isDatabaseReady()) {
    const sale = await Sale.create(salePayload);

    for (const item of saleItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantityInStock: -item.quantity },
      });
    }

    // Create Invoice if Credit or has Credit component in split
    let creditAmount = 0;
    if (salePayload.paymentMethod === 'credit') {
      creditAmount = salePayload.total;
    } else if (salePayload.paymentMethod === 'split' && salePayload.splitPayments) {
      const creditPart = salePayload.splitPayments.find(p => p.method === 'credit');
      if (creditPart) {
        creditAmount = Number(creditPart.amount || 0);
      }
    }

    if (creditAmount > 0 && salePayload.customerId) {
      await CustomerInvoice.create({
        invoiceNo: salePayload.invoiceNumber,
        customerId: salePayload.customerId,
        date: new Date(),
        totalAmount: creditAmount,
        balanceAmount: creditAmount,
        status: 'UNPAID'
      });
    }

    const plainSale = sale.toObject();
    return {
      ...plainSale,
      _id: String(plainSale._id),
      items: plainSale.items.map((item) => ({
        ...item,
        productId: String(item.productId),
      })),
    };
  }

  saleItems.forEach((item) => {
    const product = memoryStore.products.find((entry) => String(entry._id) === String(item.productId));
    product.quantityInStock -= item.quantity;
    product.updatedAt = new Date().toISOString();
  });

  const sale = {
    _id: generateId(),
    ...salePayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.sales.unshift(sale);

  return clonePlain(sale);
}

async function createReturn(payload) {
  const { type, entityId, referenceNo, items, refundMethod, reason, processedBy } = payload;

  if (!items || items.length === 0) {
    throw createError('At least one item must be returned.');
  }

  // 1. Verify and Process Stock, and calculate item totals
  const processedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw createError(`Product not found: ${item.name}`, 404);

    // If customer return, add back to stock. If supplier return, remove from stock.
    const qtyChange = type === 'customer' ? item.quantity : -item.quantity;
    await Product.findByIdAndUpdate(item.productId, { $inc: { quantityInStock: qtyChange } });

    processedItems.push({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice
    });
  }

  // 2. Calculate Total
  const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);

  // 3. Update Financials
  if (type === 'customer') {
    if (entityId) {
      const customer = await Customer.findById(entityId);
      if (customer && refundMethod === 'credit-note') {
        await Customer.findByIdAndUpdate(entityId, { $inc: { balance: -totalAmount } });
        
        // If there's a specific invoice, try to update it too
        if (referenceNo) {
          const inv = await CustomerInvoice.findOne({ invoiceNo: referenceNo, customerId: entityId });
          if (inv) {
            const nextBalance = Math.max(0, inv.balanceAmount - totalAmount);
            const status = nextBalance === 0 ? 'PAID' : 'PARTIAL';
            await CustomerInvoice.findByIdAndUpdate(inv._id, { 
              balanceAmount: nextBalance, 
              status: status 
            });
          }
        }
      }
    }
  } else {
    if (entityId) {
      const supplier = await Supplier.findById(entityId);
      if (supplier && refundMethod === 'credit-note') {
        await Supplier.findByIdAndUpdate(entityId, { $inc: { balance: -totalAmount } });
        
        if (referenceNo) {
          const inv = await SupplierInvoice.findOne({ invoiceNo: referenceNo, supplierId: entityId });
          if (inv) {
            const nextBalance = Math.max(0, inv.balanceAmount - totalAmount);
            const status = nextBalance === 0 ? 'PAID' : 'PARTIAL';
            await SupplierInvoice.findByIdAndUpdate(inv._id, { 
              balanceAmount: nextBalance, 
              status: status 
            });
          }
        }
      }
    }
  }

  // 4. Create Return Document
  const returnNo = `RET-${Date.now().toString().slice(-6)}`;
  const returnPayload = {
    returnNo,
    type,
    entityId: entityId || null,
    entityName: payload.entityName || (type === 'customer' ? 'Walk-in customer' : 'Default Supplier'),
    referenceNo,
    items: processedItems,
    totalAmount,
    reason,
    refundMethod,
    processedBy
  };

  if (isDatabaseReady()) {
    return Return.create(returnPayload);
  }

  const returnDoc = {
    _id: generateId(),
    ...returnPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.returns.unshift(returnDoc);
  return clonePlain(returnDoc);
}

async function getReturns(filters = {}) {
  if (isDatabaseReady()) {
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.entityId) query.entityId = filters.entityId;
    
    return Return.find(query).sort({ createdAt: -1 }).lean();
  }

  return clonePlain(memoryStore.returns).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function getRecentSales(limit = 8) {
  const sales = await getAllSales();
  return sales.slice(0, limit);
}

function createTrend(range, sales) {
  const now = new Date();
  const buckets = [];

  if (range === 'daily') {
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      date.setHours(0, 0, 0, 0);
      buckets.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0,
        orders: 0,
      });
    }
  } else if (range === 'weekly') {
    for (let index = 7; index >= 0; index -= 1) {
      const date = startOfWeek(now);
      date.setDate(date.getDate() - index * 7);
      buckets.push({
        key: date.toISOString().slice(0, 10),
        label: `W${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`,
        revenue: 0,
        orders: 0,
      });
    }
  } else if (range === 'monthly') {
    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      buckets.push({
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
        orders: 0,
      });
    }
  } else {
    for (let index = 4; index >= 0; index -= 1) {
      const year = now.getFullYear() - index;
      buckets.push({
        key: String(year),
        label: String(year),
        revenue: 0,
        orders: 0,
      });
    }
  }

  const map = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  sales.forEach((sale) => {
    const saleDate = new Date(sale.createdAt);
    let key = '';

    if (range === 'daily') {
      key = saleDate.toISOString().slice(0, 10);
    } else if (range === 'weekly') {
      key = startOfWeek(saleDate).toISOString().slice(0, 10);
    } else if (range === 'monthly') {
      key = `${saleDate.getFullYear()}-${saleDate.getMonth() + 1}`;
    } else {
      key = String(saleDate.getFullYear());
    }

    const bucket = map.get(key);
    if (bucket) {
      bucket.revenue = formatCurrencyAmount(bucket.revenue + Number(sale.total));
      bucket.orders += 1;
    }
  });

  return buckets;
}

function getRangeStart(range) {
  const now = new Date();

  if (range === 'daily') {
    const date = new Date(now);
    date.setDate(now.getDate() - 6);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (range === 'weekly') {
    const date = startOfWeek(now);
    date.setDate(date.getDate() - 7 * 7);
    return date;
  }

  if (range === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth() - 11, 1);
  }

  return new Date(now.getFullYear() - 4, 0, 1);
}

async function getSalesReport(range = 'weekly') {
  const sales = await getAllSales();
  const products = await getAllProducts();
  const productSalesMap = new Map();
  const validRange = ['daily', 'weekly', 'monthly', 'annual'].includes(range) ? range : 'weekly';
  const rangeStart = getRangeStart(validRange);
  const filteredSales = sales.filter((sale) => new Date(sale.createdAt) >= rangeStart);
  const totalRevenue = formatCurrencyAmount(
    filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0),
  );
  const totalOrders = filteredSales.length;
  const unitsSold = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0),
    0,
  );

  const paymentBreakdownMap = new Map();
  const categoryBreakdownMap = new Map();

  filteredSales.forEach((sale) => {
    if (sale.paymentMethod === 'split' && sale.splitPayments && sale.splitPayments.length > 0) {
      sale.splitPayments.forEach((p) => {
        paymentBreakdownMap.set(
          p.method,
          formatCurrencyAmount((paymentBreakdownMap.get(p.method) || 0) + Number(p.amount)),
        );
      });
    } else {
      paymentBreakdownMap.set(
        sale.paymentMethod,
        formatCurrencyAmount((paymentBreakdownMap.get(sale.paymentMethod) || 0) + Number(sale.total)),
      );
    }

    sale.items.forEach((item) => {
      const product = products.find((entry) => String(entry._id) === String(item.productId));
      const category = product?.category || 'Uncategorized';
      categoryBreakdownMap.set(
        category,
        formatCurrencyAmount((categoryBreakdownMap.get(category) || 0) + Number(item.lineTotal)),
      );

      // Track top products
      if (!productSalesMap.has(item.productId)) {
        productSalesMap.set(item.productId, {
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          image: item.image,
          category,
          quantity: 0,
          revenue: 0
        });
      }
      const entry = productSalesMap.get(item.productId);
      entry.quantity += Number(item.quantity);
      entry.revenue = formatCurrencyAmount(entry.revenue + Number(item.lineTotal));
    });
  });

  const topSellingProducts = [...productSalesMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    range: validRange,
    summary: {
      totalRevenue,
      totalOrders,
      unitsSold,
      averageTicket: totalOrders ? formatCurrencyAmount(totalRevenue / totalOrders) : 0,
    },
    trend: createTrend(validRange, filteredSales),
    paymentBreakdown: [...paymentBreakdownMap.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    categoryBreakdown: [...categoryBreakdownMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value),
    topSellingProducts,
    recentSales: filteredSales.slice(0, 10).map(sale => ({
      ...sale,
      cashierName: sale.cashierName || (sale.cashier?.name) || 'System'
    })),
  };
}

async function getOverviewData(user) {
  let [products, sales, users] = await Promise.all([
    getAllProducts(),
    getAllSales(),
    getAllUsersForLookup(),
  ]);

  // Role-based filtering: Cashiers only see their own sales metrics
  if (user && user.role === 'cashier') {
    sales = sales.filter(sale => 
      String(sale.cashier?.userId || sale.cashierId) === String(user._id)
    );
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const inventoryValue = formatCurrencyAmount(
    products.reduce((sum, product) => sum + Number(product.quantityInStock) * Number(product.price), 0),
  );
  const stockCost = formatCurrencyAmount(
    products.reduce((sum, product) => sum + Number(product.quantityInStock) * Number(product.costPrice), 0),
  );
  const lowStockProducts = products
    .filter((product) => Number(product.quantityInStock) <= Number(product.reorderLevel))
    .sort((left, right) => left.quantityInStock - right.quantityInStock)
    .map((product) => ({
      ...product,
      rackLabel: getRackLabel(product.rack),
    }));

  const salesToday = sales.filter((sale) => sameDay(sale.createdAt, now));
  const salesThisWeek = sales.filter((sale) => new Date(sale.createdAt) >= weekStart);
  const salesThisMonth = sales.filter((sale) => new Date(sale.createdAt) >= monthStart);
  const salesThisYear = sales.filter((sale) => new Date(sale.createdAt) >= yearStart);

  const rackSummaryMap = new Map();
  products.forEach((product) => {
    const key = `Row ${product.rack.rowNumber}`;
    if (!rackSummaryMap.has(key)) {
      rackSummaryMap.set(key, { row: key, items: 0, units: 0 });
    }
    const entry = rackSummaryMap.get(key);
    entry.items += 1;
    entry.units += Number(product.quantityInStock);
  });

  const productSalesMap = new Map();
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSalesMap.has(item.productId)) {
        productSalesMap.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantity: 0,
          revenue: 0,
          image: item.image,
          rackLabel: getRackLabel(item.rack),
        });
      }
      const entry = productSalesMap.get(item.productId);
      entry.quantity += Number(item.quantity);
      entry.revenue = formatCurrencyAmount(entry.revenue + Number(item.lineTotal));
    });
  });

  const recentSales = sales.slice(0, 6).map((sale) => ({
    ...sale,
    cashierName: sale.cashier?.name || 'Unknown cashier',
  }));

  return {
    user: sanitizeUser(user),
    metrics: {
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      inventoryValue,
      stockCost,
      revenueToday: formatCurrencyAmount(salesToday.reduce((sum, sale) => sum + Number(sale.total), 0)),
      totalOrdersToday: salesToday.length,
      revenueWeekly: formatCurrencyAmount(
        salesThisWeek.reduce((sum, sale) => sum + Number(sale.total), 0),
      ),
      revenueMonthly: formatCurrencyAmount(
        salesThisMonth.reduce((sum, sale) => sum + Number(sale.total), 0),
      ),
      revenueYearly: formatCurrencyAmount(
        salesThisYear.reduce((sum, sale) => sum + Number(sale.total), 0),
      ),
      activeUsers: users.length,
    },
    lowStockProducts,
    products: products.map((product) => ({
      ...product,
      rackLabel: getRackLabel(product.rack),
    })),
    recentSales,
    topProducts: [...productSalesMap.values()]
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 5),
    rackSummary: [...rackSummaryMap.values()],
  };
}

module.exports = {
  createSale,
  deleteProduct,
  getOverviewData,
  getProducts,
  getRecentSales,
  getSales,
  getSalesReport,
  getUserById,
  initializeStore,
  loginUser,
  saveProduct,
  getUsers,
  saveUser,
  deleteUser,
};

async function getUsers() {
  if (isDatabaseReady()) {
    const users = await User.find().sort({ name: 1 }).lean();
    return users.map((user) => sanitizeUser(user));
  }

  return memoryStore.users.map((user) => sanitizeUser(user)).sort((a, b) => a.name.localeCompare(b.name));
}

async function saveUser(payload) {
  const userData = {
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    role: ['admin', 'cashier'].includes(payload.role) ? payload.role : 'cashier',
    branch: String(payload.branch || 'Main Branch').trim(),
  };

  if (!userData.name || !userData.email) {
    throw createError('Name and email are required.');
  }

  if (payload.password) {
    userData.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  if (isDatabaseReady()) {
    if (payload._id) {
      const user = await User.findByIdAndUpdate(payload._id, userData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!user) {
        throw createError('User not found.', 404);
      }

      return sanitizeUser(user);
    }

    if (!payload.password) {
      throw createError('Password is required for new users.');
    }

    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      throw createError('User with this email already exists.');
    }

    const user = await User.create(userData);
    return sanitizeUser(user);
  }

  if (payload._id) {
    const index = memoryStore.users.findIndex((u) => String(u._id) === String(payload._id));
    if (index < 0) {
      throw createError('User not found.', 404);
    }

    memoryStore.users[index] = {
      ...memoryStore.users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    return sanitizeUser(memoryStore.users[index]);
  }

  const existing = memoryStore.users.find((u) => u.email === userData.email);
  if (existing) {
    throw createError('User with this email already exists.');
  }

  if (!payload.password) {
    throw createError('Password is required for new users.');
  }

  const newUser = {
    _id: generateId(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.users.push(newUser);

  return sanitizeUser(newUser);
}

async function deleteUser(userId) {
  if (isDatabaseReady()) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw createError('User not found.', 404);
    }
    return { success: true };
  }

  const index = memoryStore.users.findIndex((u) => String(u._id) === String(userId));
  if (index < 0) {
    throw createError('User not found.', 404);
  }

  memoryStore.users.splice(index, 1);
  return { success: true };
}

async function getSales(filters = {}) {
  const sales = await getAllSales();

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    const now = new Date();

    // Date filters
    if (filters.date === 'today') {
      if (!sameDay(sale.createdAt, now)) return false;
    } else if (filters.date === 'this-week') {
      const weekStart = startOfWeek(now);
      if (new Date(sale.createdAt) < weekStart) return false;
    } else if (filters.date === 'this-month') {
      if (saleDate.getMonth() !== now.getMonth() || saleDate.getFullYear() !== now.getFullYear()) return false;
    }

    // Cashier filter
    if (filters.cashierId && String(sale.cashier?.userId) !== String(filters.cashierId)) {
      return false;
    }

    // Query filter (invoice number or customer name)
    if (filters.query) {
      const q = String(filters.query).toLowerCase();
      const invNo = String(sale.invoiceNumber || '').toLowerCase();
      const custName = String(sale.customerName || '').toLowerCase();
      if (!invNo.includes(q) && !custName.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

module.exports = {
  createSale,
  deleteProduct,
  getOverviewData,
  getProducts,
  getRecentSales,
  getSales,
  getSalesReport,
  getUserById,
  initializeStore,
  loginUser,
  saveProduct,
  getUsers,
  saveUser,
  deleteUser,
  createReturn,
  getReturns
};
