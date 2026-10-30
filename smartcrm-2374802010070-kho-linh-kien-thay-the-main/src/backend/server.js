const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const { initDatabase } = require('./database/migrations/initDatabase');
const { seedCatalogData } = require('./database/seed');
const { authRoutes } = require('./src/modules/auth/authRoutes');
const { authenticate } = require('./src/modules/auth/authMiddleware');
const { serviceCenterRoutes } = require('./src/modules/serviceCenters/serviceCenterRoutes');
const { issueCategoryRoutes } = require('./src/modules/issueCategories/issueCategoryRoutes');
const { technicianRoutes } = require('./src/modules/technicians/technicianRoutes');
const { stockRoutes } = require('./src/modules/stock/stockRoutes');

const app = express();
const PORT = process.env.APP_PORT || 3000;
const frontendPath = path.join(__dirname, '../frontend');

app.use(express.json());
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && Object.prototype.hasOwnProperty.call(error, 'body')) {
    return res.status(400).json({
      code: 'INVALID_JSON',
      message: 'Nội dung request phải là JSON hợp lệ.'
    });
  }
  return next(error);
});
app.get('/config.js', (req, res) => {
  res.type('application/javascript').send(
    `window.SMARTCRM_API_BASE = ${JSON.stringify(process.env.API_BASE_URL || '/api/v1')};`
  );
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', authenticate);
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
  if (!process.env.AUTH_TOKEN_SECRET) {
    console.warn('AUTH_TOKEN_SECRET is not set; login sessions will expire when the server restarts.');
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
