//backend\server.js
const dotenv = require('dotenv');

dotenv.config();

const { createApp } = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const { initializeStore } = require('./src/services/store');

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDatabase();
  await initializeStore();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Inventory API listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
