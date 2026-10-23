const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabase } = require('./database/migrations/initDatabase');
const { seedCatalogData } = require('./database/seed');
const { serviceCenterRoutes } = require('./src/modules/serviceCenters/serviceCenterRoutes');
const { issueCategoryRoutes } = require('./src/modules/issueCategories/issueCategoryRoutes');
const { technicianRoutes } = require('./src/modules/technicians/technicianRoutes');
const { stockRoutes } = require('./src/modules/stock/stockRoutes');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.APP_PORT || 3000;
const frontendPath = path.join(__dirname, '../frontend');

app.use(express.json());
app.get('/config.js', (req, res) => {
  res.type('application/javascript').send(
    `window.SMARTCRM_API_BASE = ${JSON.stringify(process.env.API_BASE_URL || '/api/v1')};`
  );
});
app.use('/api/v1/service-centers', serviceCenterRoutes);
app.use('/api/v1/issue-categories', issueCategoryRoutes);
app.use('/api/v1/technicians', technicianRoutes);
app.use('/api/v1', stockRoutes);
app.use(express.static(frontendPath));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'smartcrm-stock-module', timestamp: new Date().toISOString() });
});

async function startServer() {
  await initDatabase();
  await seedCatalogData();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
