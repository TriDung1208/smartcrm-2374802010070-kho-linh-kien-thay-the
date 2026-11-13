# Nhật ký lỗi BT2 và BT3

## BUG-BT2-01 – Lệnh migrate/seed không thực thi khi gọi từ npm

1. **Triệu chứng:** `npm run migrate` và `npm run seed` kết thúc nhưng không tạo schema hoặc nạp danh mục.
2. **Tái lập:** chạy từng lệnh từ `src/backend` với một đường dẫn SQLite mới trong `SMARTCRM_DB_PATH`.
3. **Khoanh vùng:** hai tệp CLI chỉ export hàm, không gọi hàm khi chạy trực tiếp bằng Node.js.
4. **Nguyên nhân gốc:** chưa có nhánh `require.main === module` để thực thi tác vụ và báo lỗi qua exit code.
5. **Sửa lỗi:** gọi `initDatabase()` từ migration; lệnh seed khởi tạo schema rồi nạp danh mục, cả hai đều báo lỗi rõ nếu thất bại.
6. **Kiểm thử hồi quy:** `src/backend/src/modules/serviceCenters/crud.test.js` xác nhận seed lần hai không tăng số dòng.
7. **Xác minh:** migrate thành công; seed hai lần trên database tạm vẫn có 6 trung tâm và 7 bản ghi tồn; `npm test` PASS.
8. **Commit liên quan:** [2603836e9c423f123bafb2acfbe56e80f47e84c0](https://github.com/TriDung1208/smartcrm-2374802010070-kho-linh-kien-thay-the/commit/2603836e9c423f123bafb2acfbe56e80f47e84c0). Commit này chứa thay đổi migration/seed và nhật ký lỗi; chưa có commit riêng chỉ chứa bản sửa lỗi.

## Ba lỗi BT3 được tái lập và sửa

### BUG-BT3-01 – Bộ lọc loại giao dịch không hợp lệ trả danh sách rỗng

1. **Triệu chứng:** `GET /stock-transactions?type=BAD` trả `200` với danh sách rỗng thay vì báo dữ liệu lọc không hợp lệ.
2. **Nguyên nhân gốc:** service chuyển trực tiếp `type` vào repository mà không kiểm tra chỉ nhận `IN` hoặc `OUT`.
3. **Sửa lỗi:** thêm validation, trả `400 INVALID_TRANSACTION_TYPE` với bộ lọc sai.
4. **Kiểm thử hồi quy:** test xác nhận `IN` hợp lệ, bộ lọc bỏ trống hợp lệ và `BAD` bị từ chối.
5. **Commit riêng:** `cd49d00` (`fix: validate stock transaction type filters`).

### BUG-BT3-02 – ID lọc tồn kho sai bị coi như không có dữ liệu

1. **Triệu chứng:** `GET /stocks?centerId=abc` trả danh sách rỗng; truy vấn một mặt hàng với ID sai có thể trả `404` thay vì `400`.
2. **Nguyên nhân gốc:** các API đọc tồn, cảnh báo và lịch sử truyền ID truy vấn vào repository mà không xác thực số nguyên dương.
3. **Sửa lỗi:** dùng validation ID dùng chung; ID sai trả `400 INVALID_CENTER_ID` hoặc `400 INVALID_PART_ID`.
4. **Kiểm thử hồi quy:** unit test validation; smoke test service trên SQLite tạm, lưu tại `docs/evidence/stock-query-smoke-bt3.txt`.
5. **Commit riêng:** `2af84b3` (`fix: validate stock query identifiers`).

### BUG-BT3-03 – Nhập kho vượt giới hạn số nguyên an toàn

1. **Triệu chứng:** cộng một đơn vị vào `Number.MAX_SAFE_INTEGER` cho kết quả không còn là số nguyên an toàn; nếu lưu tiếp, lượng tồn không còn chính xác.
2. **Nguyên nhân gốc:** phép cộng tồn kho không kiểm tra giới hạn biểu diễn chính xác của JavaScript `Number`.
3. **Sửa lỗi:** từ chối cập nhật vượt giới hạn với `409 STOCK_LIMIT_EXCEEDED`, trước khi ghi database.
4. **Kiểm thử hồi quy:** xác nhận phép cộng ở biên bị từ chối.
5. **Commit riêng:** `e609793` (`fix: guard stock quantity overflow`).

Ba lỗi BT3 trên đều được tái lập, có test hồi quy và có commit sửa riêng. BUG-BT2-01 là lỗi lịch sử đã sửa trước đó; commit của nó chứa nhiều thay đổi BT2 nên không tính là một trong ba commit sửa lỗi độc lập của BT3.
