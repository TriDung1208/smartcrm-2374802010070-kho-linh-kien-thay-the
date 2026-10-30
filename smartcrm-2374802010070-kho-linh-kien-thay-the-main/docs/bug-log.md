# Nhật ký lỗi BT2

## BUG-BT2-01 – Lệnh migrate/seed không thực thi khi gọi từ npm

1. **Triệu chứng:** `npm run migrate` và `npm run seed` kết thúc nhưng không tạo schema hoặc nạp danh mục.
2. **Tái lập:** chạy từng lệnh từ `src/backend` với một đường dẫn SQLite mới trong `SMARTCRM_DB_PATH`.
3. **Khoanh vùng:** hai tệp CLI chỉ export hàm, không gọi hàm khi chạy trực tiếp bằng Node.js.
4. **Nguyên nhân gốc:** chưa có nhánh `require.main === module` để thực thi tác vụ và báo lỗi qua exit code.
5. **Sửa lỗi:** gọi `initDatabase()` từ migration; lệnh seed khởi tạo schema rồi nạp danh mục, cả hai đều báo lỗi rõ nếu thất bại.
6. **Kiểm thử hồi quy:** `src/backend/src/modules/serviceCenters/crud.test.js` xác nhận seed lần hai không tăng số dòng.
7. **Xác minh:** migrate thành công; seed hai lần trên database tạm vẫn có 6 trung tâm và 7 bản ghi tồn; `npm test` PASS.
