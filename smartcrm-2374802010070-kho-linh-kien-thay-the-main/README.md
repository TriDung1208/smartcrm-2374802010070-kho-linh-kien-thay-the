# Smart CRM Mekong Mobile – L5 Kho linh kiện thay thế

**Bài toán tổng thể:** Hệ thống tiếp nhận và phân loại yêu cầu bảo hành cho Mekong Mobile.
**Phạm vi BT2:** phân hệ L5 – quản lý kho linh kiện thay thế.
**Track:** SE · **Sinh viên:** Trần Trí Dũng · **MSSV:** 2374802010070

Phân hệ hỗ trợ tra cứu tồn kho theo trung tâm, nhập kho, xuất linh kiện có kiểm tra tồn, cảnh báo dưới ngưỡng và xem lịch sử giao dịch. Mã phiếu bảo hành được lưu làm tham chiếu khi xuất; phiên bản này chưa kết nối hoặc xác minh phiếu với một phân hệ bảo hành.

## Môi trường

| Thành phần | Phiên bản |
|---|---|
| Node.js | 18.x hoặc 20.x |
| npm | Đi kèm Node.js (npm 9 trở lên) |
| Cơ sở dữ liệu | SQLite, tạo tự động khi migrate |
| Hệ điều hành | Windows 10/11, Ubuntu hoặc macOS |

`src/backend/package-lock.json` khóa phiên bản dependency để `npm ci` cài đúng bộ thư viện.

## Cài đặt và chạy

Từ PowerShell, clone repo và tạo `.env` từ mẫu:

```powershell
git clone https://github.com/TriDung1208/smartcrm-2374802010070-kho-linh-kien-thay-the.git thu-nghiem
Set-Location thu-nghiem
Copy-Item .env.example .env
Set-Location src\backend
npm ci
npm run migrate
npm run seed
npm test
npm start
```

Trên macOS/Linux, thay `Copy-Item .env.example .env` bằng `cp .env.example .env`; các lệnh còn lại chạy trong `src/backend`.

- Backend và giao diện tích hợp: <http://localhost:3000>
- Health check: <http://localhost:3000/health>
- Cơ sở dữ liệu mặc định: `src/backend/data/smartcrm.db`
- Migration tạo cấu trúc bảng; seed có thể chạy lặp mà không chèn trùng dữ liệu.
- Khi cần cấu hình token ổn định qua lần khởi động, đặt `AUTH_TOKEN_SECRET` trong `.env` bằng giá trị ngẫu nhiên riêng. Không dùng giá trị thật trong `.env.example`.

### Chạy giao diện độc lập với backend

Để giao diện vẫn tải được khi backend tắt, mở terminal thứ hai tại `src/backend`:

```powershell
npm run frontend
```

Mở <http://localhost:5173>. Giao diện được phục vụ độc lập; yêu cầu API được chuyển đến backend tại cổng 3000. Khi backend không chạy, trang vẫn mở và hiển thị thông báo máy chủ không khả dụng thay vì bị sập.

## Kiến trúc và chức năng

Backend dùng kiến trúc ba lớp `routes → service → repository`; migration và seed nằm trong `src/backend/database`. SQLite lưu dữ liệu theo trung tâm, giao dịch nhập/xuất cập nhật tồn và lịch sử trong cùng transaction.

Các màn hình gọi API thật:

1. **Tồn kho:** tìm kiếm, lọc trạng thái và xem ngưỡng cảnh báo.
2. **Xuất linh kiện:** kiểm tra dữ liệu, tồn khả dụng và mã phiếu tham chiếu.
3. **Nhập kho & lịch sử:** ghi nhận nhập và tra cứu giao dịch.

Hai thực thể có API CRUD đầy đủ là **trung tâm dịch vụ** và **nhóm lỗi**. Các API nghiệp vụ cần đăng nhập; đăng ký tài khoản dùng cho demo được mở công khai. Bản hiện tại chưa phân quyền theo vai trò.

## Kiểm thử

Chạy tất cả kiểm thử bằng một lệnh từ `src/backend`:

```powershell
npm test
```

Node.js test runner kiểm tra luồng đúng, biên, dữ liệu sai, CRUD, chống xóa trung tâm đang được tham chiếu và seed lặp. Kết quả kiểm thử phải được chạy lại tại máy nộp; không dùng dữ liệu SQLite sẵn có làm fixture.

## Thử API bằng curl

Đăng ký tài khoản thử nghiệm:

```powershell
curl.exe -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"username\":\"demo.user\",\"password\":\"Demo-Pass-2026\"}"
```

Sao chép `token` trong response rồi dùng header `Authorization: Bearer <TOKEN>` cho các route dưới đây.

### Trung tâm dịch vụ

```powershell
curl.exe http://localhost:3000/api/v1/service-centers -H "Authorization: Bearer <TOKEN>"
curl.exe -X POST http://localhost:3000/api/v1/service-centers -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"centerCode\":\"TT99\",\"centerName\":\"TTBH Demo\",\"city\":\"Cần Thơ\"}"
curl.exe -X PUT http://localhost:3000/api/v1/service-centers/7 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"centerCode\":\"TT99\",\"centerName\":\"TTBH Demo cập nhật\",\"city\":\"Cần Thơ\"}"
curl.exe -X DELETE http://localhost:3000/api/v1/service-centers/7 -H "Authorization: Bearer <TOKEN>"
```

### Nhóm lỗi

```powershell
curl.exe http://localhost:3000/api/v1/issue-categories -H "Authorization: Bearer <TOKEN>"
curl.exe -X POST http://localhost:3000/api/v1/issue-categories -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"categoryName\":\"LOI_KET_NOI\",\"defaultPriority\":\"CAO\",\"isActive\":true}"
curl.exe -X PUT http://localhost:3000/api/v1/issue-categories/7 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"categoryName\":\"LOI_KET_NOI\",\"defaultPriority\":\"TRUNG_BINH\",\"isActive\":true}"
curl.exe -X DELETE http://localhost:3000/api/v1/issue-categories/7 -H "Authorization: Bearer <TOKEN>"
```

ID `7` là ví dụ; dùng ID trong response tạo mới. Xóa trung tâm có kỹ thuật viên hoặc giao dịch kho liên kết bị từ chối với HTTP 409.

## Biến môi trường và dữ liệu

Sao chép `.env.example` thành `.env` rồi chỉnh các biến khi cần. `APP_PORT`, `FRONTEND_PORT`, `API_PORT`, `API_BASE_URL`, `SMARTCRM_DB_PATH` và `AUTH_TOKEN_SECRET` là các biến cấu hình. Không commit `.env`, thông tin đăng nhập hoặc database runtime.

## Tài liệu

- [Hợp đồng API](docs/api-contract.md)
- [SRS](docs/srs.md)
- [Thay đổi thiết kế](docs/thay-doi-thiet-ke.md)
- [Khai báo AI](docs/ai-disclosure.md)
- [Nhật ký lỗi](docs/bug-log.md)
