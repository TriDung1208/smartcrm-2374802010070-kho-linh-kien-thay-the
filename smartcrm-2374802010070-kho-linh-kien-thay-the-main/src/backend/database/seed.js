const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { DB_PATH } = require('./migrations/initDatabase');

const seedData = {
  service_centers: [
    { center_id: 1, center_code: 'TT01', center_name: 'TTBH Quận 10', city: 'TP. Hồ Chí Minh' },
    { center_id: 2, center_code: 'TT02', center_name: 'TTBH Quận Tân Bình', city: 'TP. Hồ Chí Minh' },
    { center_id: 3, center_code: 'TT03', center_name: 'TTBH TP. Thủ Đức', city: 'TP. Hồ Chí Minh' },
    { center_id: 4, center_code: 'TT04', center_name: 'TTBH Ninh Kiều', city: 'Cần Thơ' },
    { center_id: 5, center_code: 'TT05', center_name: 'TTBH Cái Răng', city: 'Cần Thơ' },
    { center_id: 6, center_code: 'TT06', center_name: 'TTBH Cầu Giấy', city: 'Hà Nội' }
  ],
  issue_categories: [
    { category_id: 1, category_name: 'MAN_HINH', default_priority: 'CAO', is_active: 1 },
    { category_id: 2, category_name: 'PIN', default_priority: 'TRUNG_BINH', is_active: 1 },
    { category_id: 3, category_name: 'SAC', default_priority: 'TRUNG_BINH', is_active: 1 },
    { category_id: 4, category_name: 'PHAN_MEM', default_priority: 'THAP', is_active: 1 },
    { category_id: 5, category_name: 'NUOC_VAO', default_priority: 'CAO', is_active: 1 },
    { category_id: 6, category_name: 'KHAC', default_priority: 'TRUNG_BINH', is_active: 1 }
  ],
  technicians: [
    { technician_id: 1, technician_code: 'KT001', ho_ten: 'Phạm Minh Quyên', center_id: 1, level: 'TRUNG_CAP', is_active: 1 },
    { technician_id: 2, technician_code: 'KT002', ho_ten: 'Trần Hoài Giang', center_id: 4, level: 'TRUNG_CAP', is_active: 1 },
    { technician_id: 3, technician_code: 'KT003', ho_ten: 'Đặng Quang Oanh', center_id: 3, level: 'CAO_CAP', is_active: 1 },
    { technician_id: 4, technician_code: 'KT004', ho_ten: 'Phan Thị Yến', center_id: 4, level: 'TRUNG_CAP', is_active: 1 }
  ],
  parts: [
    { part_id: 1, part_code: 'MH-SS-01', part_name: 'Màn hình Samsung loại 1', unit_price: 2200000 },
    { part_id: 2, part_code: 'MH-SS-02', part_name: 'Màn hình Samsung loại 2', unit_price: 150000 },
    { part_id: 3, part_code: 'MH-SS-03', part_name: 'Màn hình Samsung loại 3', unit_price: 150000 },
    { part_id: 4, part_code: 'MH-XM-01', part_name: 'Màn hình Xiaomi loại 1', unit_price: 280000 },
    { part_id: 5, part_code: 'MH-XM-02', part_name: 'Màn hình Xiaomi loại 2', unit_price: 650000 }
  ],
  part_stock: [
    { center_id: 1, part_id: 1, quantity: 16, min_threshold: 8 },
    { center_id: 1, part_id: 2, quantity: 10, min_threshold: 3 },
    { center_id: 1, part_id: 3, quantity: 4, min_threshold: 3 },
    { center_id: 1, part_id: 5, quantity: 18, min_threshold: 8 },
    { center_id: 2, part_id: 1, quantity: 12, min_threshold: 5 },
    { center_id: 2, part_id: 2, quantity: 7, min_threshold: 3 },
    { center_id: 3, part_id: 3, quantity: 9, min_threshold: 4 }
  ]
};

function seedCatalogData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);

      const rows = [];
      Object.entries(seedData).forEach(([table, data]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const columns = Object.keys(data[0]);
        const placeholders = data.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
        const values = data.flatMap((row) => columns.map((col) => row[col]));
        rows.push({ table, columns, placeholders, values });
      });

      db.serialize(() => {
        rows.forEach(({ table, columns, placeholders, values }) => {
          db.run(`INSERT OR IGNORE INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`, values, (insertErr) => {
            if (insertErr) {
              reject(insertErr);
            }
          });
        });

        db.close((closeErr) => {
          if (closeErr) return reject(closeErr);
          resolve();
        });
      });
    });
  });
}

module.exports = { seedCatalogData };
