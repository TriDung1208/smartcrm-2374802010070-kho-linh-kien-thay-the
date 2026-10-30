const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smartcrm-se-crud-'));
process.env.SMARTCRM_DB_PATH = path.join(tempDir, 'test.db');

const sqlite3 = require('sqlite3').verbose();
const { initDatabase } = require('../../../database/migrations/initDatabase');
const { seedCatalogData } = require('../../../database/seed');
const serviceCenters = require('./serviceCenterService');
const issueCategories = require('../issueCategories/issueCategoryService');

function runSql(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(process.env.SMARTCRM_DB_PATH);
    db.run(query, params, function (error) {
      db.close((closeError) => {
        if (error) return reject(error);
        if (closeError) return reject(closeError);
        resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  });
}

function countRows(table) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(process.env.SMARTCRM_DB_PATH);
    db.get(`SELECT COUNT(*) AS count FROM ${table}`, (error, row) => {
      db.close((closeError) => {
        if (error) return reject(error);
        if (closeError) return reject(closeError);
        resolve(row.count);
      });
    });
  });
}

test.before(async () => {
  await initDatabase();
  await seedCatalogData();
});

test.after(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('service centers support create, read, update, and delete', async () => {
  const created = await serviceCenters.createServiceCenter({
    centerCode: 'TEST01',
    centerName: 'Trung tâm kiểm thử',
    city: 'Cần Thơ'
  });

  assert.equal((await serviceCenters.getServiceCenterById(created.center_id)).center_name, 'Trung tâm kiểm thử');

  const updated = await serviceCenters.updateServiceCenter(created.center_id, {
    centerCode: 'TEST01',
    centerName: 'Trung tâm đã cập nhật',
    city: 'TP. Hồ Chí Minh'
  });
  assert.equal(updated.center_name, 'Trung tâm đã cập nhật');
  assert.ok((await serviceCenters.getAllServiceCenters()).some((center) => center.center_id === created.center_id));

  await serviceCenters.deleteServiceCenter(created.center_id);
  await assert.rejects(
    () => serviceCenters.getServiceCenterById(created.center_id),
    { code: 'SERVICE_CENTER_NOT_FOUND', statusCode: 404 }
  );
});

test('service center deletion is blocked when the center has linked records', async () => {
  const center = await serviceCenters.createServiceCenter({
    centerCode: 'TEST02',
    centerName: 'Trung tâm có kỹ thuật viên',
    city: 'Cần Thơ'
  });
  await runSql(
    'INSERT INTO technicians (technician_code, ho_ten, center_id, level) VALUES (?, ?, ?, ?)',
    ['TEST-KT', 'Kỹ thuật viên thử nghiệm', center.center_id, 'TRUNG_CAP']
  );

  await assert.rejects(
    () => serviceCenters.deleteServiceCenter(center.center_id),
    { code: 'SERVICE_CENTER_IN_USE', statusCode: 409 }
  );
});

test('service center input rejects invalid fields and duplicate codes', async () => {
  await assert.rejects(
    () => serviceCenters.createServiceCenter({ centerCode: '', centerName: 'Tên', city: 'Cần Thơ' }),
    { code: 'INVALID_SERVICE_CENTER', statusCode: 400 }
  );
  await assert.rejects(
    () => serviceCenters.createServiceCenter({
      centerCode: 'TT01',
      centerName: 'Trùng mã',
      city: 'Cần Thơ'
    }),
    { code: 'SERVICE_CENTER_CODE_TAKEN', statusCode: 409 }
  );
});

test('issue categories support create, read, update, and delete', async () => {
  const created = await issueCategories.createIssueCategory({
    categoryName: 'LOI_KET_NOI',
    defaultPriority: 'CAO',
    isActive: true
  });
  assert.equal((await issueCategories.getIssueCategoryById(created.category_id)).category_name, 'LOI_KET_NOI');

  const updated = await issueCategories.updateIssueCategory(created.category_id, {
    categoryName: 'LOI_KET_NOI_MANG',
    defaultPriority: 'TRUNG_BINH',
    isActive: false
  });
  assert.equal(updated.category_name, 'LOI_KET_NOI_MANG');
  assert.equal(updated.is_active, 0);

  await issueCategories.deleteIssueCategory(created.category_id);
  await assert.rejects(
    () => issueCategories.getIssueCategoryById(created.category_id),
    { code: 'ISSUE_CATEGORY_NOT_FOUND', statusCode: 404 }
  );
});

test('issue category validation rejects invalid priority and active flag', async () => {
  await assert.rejects(
    () => issueCategories.createIssueCategory({
      categoryName: 'DANH_MUC_SAI',
      defaultPriority: 'KHAN_CAP',
      isActive: true
    }),
    { code: 'INVALID_CATEGORY', statusCode: 400 }
  );
  await assert.rejects(
    () => issueCategories.createIssueCategory({
      categoryName: 'DANH_MUC_SAI',
      defaultPriority: 'CAO',
      isActive: 1
    }),
    { code: 'INVALID_CATEGORY', statusCode: 400 }
  );
});

test('seeding twice keeps catalog row counts unchanged', async () => {
  const before = {
    centers: await countRows('service_centers'),
    categories: await countRows('issue_categories'),
    technicians: await countRows('technicians'),
    parts: await countRows('parts'),
    stock: await countRows('part_stock')
  };

  await seedCatalogData();

  assert.deepEqual({
    centers: await countRows('service_centers'),
    categories: await countRows('issue_categories'),
    technicians: await countRows('technicians'),
    parts: await countRows('parts'),
    stock: await countRows('part_stock')
  }, before);
});
