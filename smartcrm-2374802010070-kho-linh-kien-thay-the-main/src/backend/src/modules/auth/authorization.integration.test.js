const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smartcrm-authz-'));
process.env.SMARTCRM_DB_PATH = path.join(tempDir, 'test.db');

const { initDatabase } = require('../../../database/migrations/initDatabase');
const { authRoutes } = require('./authRoutes');
const { authenticate } = require('./authMiddleware');
const { createAccessToken } = require('./authService');
const { createUser, setUserRole } = require('./authRepository');
const { serviceCenterRoutes } = require('../serviceCenters/serviceCenterRoutes');
const { issueCategoryRoutes } = require('../issueCategories/issueCategoryRoutes');
const { technicianRoutes } = require('../technicians/technicianRoutes');

let server;
let baseUrl;
let warehouseToken;
let adminToken;

test.before(async () => {
  await initDatabase();
  const warehouse = await createUser({
    username: 'warehouse',
    passwordHash: 'test-hash',
    passwordSalt: 'test-salt'
  });
  const admin = await createUser({
    username: 'admin',
    passwordHash: 'test-hash',
    passwordSalt: 'test-salt'
  });
  await setUserRole('admin', 'ADMIN');
  warehouseToken = createAccessToken({ user_id: warehouse.userId, username: warehouse.username });
  adminToken = createAccessToken({ user_id: admin.userId, username: admin.username });

  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', authenticate);
  app.use('/api/v1/service-centers', serviceCenterRoutes);
  app.use('/api/v1/issue-categories', issueCategoryRoutes);
  app.use('/api/v1/technicians', technicianRoutes);

  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function request(pathname, token, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return response;
}

test('role-protected APIs allow warehouse reads and require ADMIN for management', async () => {
  assert.equal((await request('/service-centers', warehouseToken)).status, 200);
  assert.equal((await request('/service-centers', warehouseToken, 'POST', {
    centerCode: 'WH01',
    centerName: 'Warehouse center',
    city: 'Can Tho'
  })).status, 403);

  assert.equal((await request('/service-centers', adminToken, 'POST', {
    centerCode: 'AD01',
    centerName: 'Admin center',
    city: 'Can Tho'
  })).status, 201);
  assert.equal((await request('/issue-categories', warehouseToken, 'POST', {
    categoryName: 'TEST_CATEGORY',
    defaultPriority: 'CAO',
    isActive: true
  })).status, 403);
  assert.equal((await request('/technicians', warehouseToken)).status, 403);
});

test('public registration and login return the server-assigned warehouse role', async () => {
  const registration = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'new.warehouse', password: 'strong-pass-1' })
  });
  assert.equal(registration.status, 201);
  assert.equal((await registration.json()).user.role, 'WAREHOUSE');

  const login = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'new.warehouse', password: 'strong-pass-1' })
  });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).user.role, 'WAREHOUSE');
});
