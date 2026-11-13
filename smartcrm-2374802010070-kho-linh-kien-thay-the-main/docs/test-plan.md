# Test Plan – BT3 / checklist buổi 14

## Mục tiêu và phạm vi

Xác minh các quy tắc nghiệp vụ cốt lõi của phân hệ L5 Kho linh kiện thay thế: xác thực thông tin đăng nhập và token, phân quyền ADMIN/WAREHOUSE, CRUD trung tâm/nhóm lỗi, nhập/xuất kho, kiểm tra dữ liệu biên, tính toàn vẹn dữ liệu danh mục và khả năng chạy lặp seed.

Đây là kế hoạch cho bộ kiểm thử tự động hiện có ở `src/backend/src/modules`. Bộ test kiểm tra service/rule trực tiếp; không thay thế kiểm thử tích hợp HTTP, kiểm thử giao diện toàn diện, kiểm thử tải hay kiểm thử đồng thời nhiều yêu cầu xuất kho.

## Môi trường và cách chạy

- Hệ điều hành: Windows.
- Runtime ghi nhận ở lần chạy: Node.js `v24.21.0`, npm `11.19.0`, SQLite.
- Thư mục chạy: `src/backend`.
- Lệnh chạy toàn bộ: `npm test`.
- Các test CRUD dùng SQLite tạm trong thư mục hệ thống tạm và dọn sau khi hoàn tất; các test rule/auth không dùng database.
- Dữ liệu dùng trong test là dữ liệu riêng của test, không dựa vào database runtime trong repo.

README công bố Node.js 22.x hoặc 24.x. Môi trường chạy thực tế trong lần ghi nhận này là Node.js 24.21.0.

## Danh sách test case

| ID | Loại checklist | Test case và dữ liệu chính | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | Luồng đúng | Chuẩn hóa username hợp lệ có khoảng trắng và chữ hoa | Username được trim và chuyển chữ thường |
| TC-02 | Dữ liệu sai | Username sai định dạng hoặc password quá ngắn | Bị từ chối với lỗi validation |
| TC-03 | Bảo mật / chất lượng dữ liệu | Tạo password hash, xác minh password đúng và sai | Hash/salt được tạo; password đúng được xác nhận, password sai không được xác nhận |
| TC-04 | Bảo mật / chất lượng dữ liệu | Tạo access token hợp lệ, sửa token và đưa token sai định dạng | Token nguyên vẹn trả đúng danh tính; token bị sửa/sai định dạng bị từ chối |
| TC-05 | Luồng đúng | Tạo, đọc, cập nhật, xóa trung tâm dịch vụ | CRUD thành công; bản ghi sau xóa không còn được tìm thấy |
| TC-06 | Bảo mật / chất lượng dữ liệu | Xóa trung tâm đang được kỹ thuật viên tham chiếu | Từ chối xóa với `SERVICE_CENTER_IN_USE` |
| TC-07 | Dữ liệu sai / chất lượng dữ liệu | Tạo trung tâm thiếu trường hoặc trùng mã | Từ chối dữ liệu sai và mã trùng |
| TC-08 | Luồng đúng | Tạo, đọc, cập nhật, xóa nhóm lỗi | CRUD thành công và giá trị cập nhật được lưu |
| TC-09 | Dữ liệu sai | Tạo nhóm lỗi với độ ưu tiên hoặc `isActive` sai kiểu/giá trị | Bị từ chối với `INVALID_CATEGORY` |
| TC-10 | Tái lập / chất lượng dữ liệu | Chạy seed lần hai và so sánh số dòng danh mục | Số dòng không đổi, không chèn trùng |
| TC-11 | Luồng đúng | Nhập kho với ID hợp lệ và số lượng nguyên dương | Dữ liệu được chuẩn hóa và chấp nhận |
| TC-12 | Biên | Nhập kho với số lượng bằng 0 | Bị từ chối với `INVALID_QUANTITY` |
| TC-13 | Dữ liệu sai | Nhập kho với số lượng âm | Bị từ chối với `INVALID_QUANTITY` |
| TC-14 | Dữ liệu sai | Nhập kho với số lượng thập phân | Bị từ chối với `INVALID_QUANTITY` |
| TC-15 | Dữ liệu sai | Xuất kho không có `ticketId` | Bị từ chối với `INVALID_TICKET_ID` |
| TC-16 | Biên / luồng đúng | Xuất đúng bằng lượng tồn hiện có | Được chấp nhận và tồn còn bằng 0 |
| TC-17 | Biên / dữ liệu sai | Xuất nhiều hơn tồn hiện có | Bị từ chối với `INSUFFICIENT_STOCK`; lỗi nêu tồn hiện có và số lượng yêu cầu |
| TC-18 | Dữ liệu sai | Lọc lịch sử với `type=BAD` | Bị từ chối với `INVALID_TRANSACTION_TYPE` |
| TC-19 | Dữ liệu sai | Lọc tồn kho hoặc lịch sử bằng ID không phải số nguyên dương | Bị từ chối với `INVALID_CENTER_ID` hoặc `INVALID_PART_ID`, không giả dạng danh sách rỗng/không tìm thấy |
| TC-20 | Biên / chất lượng dữ liệu | Nhập một đơn vị khi tồn hiện tại là `Number.MAX_SAFE_INTEGER` | Bị từ chối với `STOCK_LIMIT_EXCEEDED`; không ghi tồn bị làm tròn |
| TC-21 | Bảo mật / chất lượng dữ liệu | Tạo tài khoản mới và đổi vai trò qua thao tác quản trị cục bộ | Tài khoản mới là `WAREHOUSE`; thao tác quản trị đổi được giữa `ADMIN` và `WAREHOUSE` |
| TC-22 | Bảo mật | Gọi middleware bằng vai trò được phép | Request được chuyển tiếp |
| TC-23 | Bảo mật | Nhân viên kho gọi middleware chỉ dành cho ADMIN | Bị từ chối với HTTP 403 `FORBIDDEN` |
| TC-24 | Bảo mật | Request không có người dùng đã xác thực gọi middleware chỉ dành cho ADMIN | Bị từ chối với HTTP 403 `FORBIDDEN` |
| TC-25 | Tái lập / chất lượng dữ liệu | Chạy migration trên bảng users cũ chưa có cột role | Cột role được thêm; tài khoản cũ nhận mặc định `WAREHOUSE` |
| TC-26 | Tích hợp / bảo mật | Nhân viên kho đọc danh mục nhưng thử ghi trung tâm, nhóm lỗi hoặc đọc kỹ thuật viên | GET danh mục trả 200; thao tác/route ADMIN-only trả 403; ADMIN có thể tạo trung tâm |
| TC-27 | Tích hợp / bảo mật | Đăng ký tài khoản và đăng nhập qua HTTP API | Cả hai API trả thành công và vai trò do server cấp là `WAREHOUSE` |

## Tiêu chí PASS/FAIL

- **PASS:** kết quả thực tế khớp kết quả mong đợi; test runner báo thành công.
- **FAIL:** test runner báo lỗi hoặc kết quả khác mong đợi. Không đổi FAIL thành PASS nếu chưa sửa và chạy lại.
- Ghi số lượng test theo các subtest Node.js hiển thị trong summary; không tính ảnh UI/API ngoài bộ test vào tổng số test tự động.
- Kiểm tra Docker trong môi trường có Docker Engine bằng `docker compose up --build -d`, `docker compose ps` và `/health`; lưu kết quả build/run làm minh chứng triển khai.
