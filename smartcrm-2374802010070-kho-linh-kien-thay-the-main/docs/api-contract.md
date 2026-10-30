# Hợp đồng API – L5 Kho linh kiện thay thế

## Quy ước

- Base URL: `/api/v1`; dữ liệu request/response dùng JSON.
- Tất cả route dưới `/api/v1` cần đăng nhập, ngoại trừ `/auth/register` và `/auth/login`.
- Gửi token qua `Authorization: Bearer <token>`.
- Lỗi có dạng `{ "code": "...", "message": "..." }`; lỗi tồn kho có thêm `details`.
- Các API tra cứu trả trường theo tên cột SQLite (`snake_case`). CRUD nhận tên trường `camelCase` như ví dụ.

## Xác thực

`POST /auth/register` và `POST /auth/login` nhận `{ "username": "...", "password": "..." }` và trả token cùng thông tin người dùng. Username có 3–32 ký tự; mật khẩu từ 8–128 ký tự.

## CRUD trung tâm dịch vụ

| Method | Route | Kết quả |
|---|---|---|
| GET | `/service-centers` | Danh sách trung tâm |
| GET | `/service-centers/:centerId` | Chi tiết trung tâm |
| POST | `/service-centers` | Tạo, trả `201` |
| PUT | `/service-centers/:centerId` | Cập nhật đầy đủ trường, trả `200` |
| DELETE | `/service-centers/:centerId` | Xóa, trả `204` |

POST/PUT nhận:

```json
{
  "centerCode": "TT99",
  "centerName": "TTBH Demo",
  "city": "Cần Thơ"
}
```

`centerCode`, `centerName`, `city` là chuỗi không rỗng, tối đa 100 ký tự. Không cho xóa trung tâm còn kỹ thuật viên, tồn kho hoặc giao dịch; API trả `409 SERVICE_CENTER_IN_USE`. Mã trung tâm trùng trả `409 SERVICE_CENTER_CODE_TAKEN`.

## CRUD nhóm lỗi

| Method | Route | Kết quả |
|---|---|---|
| GET | `/issue-categories` | Danh sách nhóm lỗi |
| GET | `/issue-categories/:categoryId` | Chi tiết nhóm lỗi |
| POST | `/issue-categories` | Tạo, trả `201` |
| PUT | `/issue-categories/:categoryId` | Cập nhật đầy đủ trường, trả `200` |
| DELETE | `/issue-categories/:categoryId` | Xóa, trả `204` |

POST/PUT nhận:

```json
{
  "categoryName": "LOI_KET_NOI",
  "defaultPriority": "CAO",
  "isActive": true
}
```

`categoryName` không rỗng (tối đa 80 ký tự); `defaultPriority` là `THAP`, `TRUNG_BINH` hoặc `CAO`; `isActive` phải là boolean.

## Kho linh kiện

### Tra cứu tồn

`GET /stocks?centerId=1` trả danh sách tồn theo trung tâm. Thêm `partId` để tra cứu một bản ghi:

```json
{
  "center_id": 1,
  "part_id": 1,
  "part_code": "MH-SS-01",
  "part_name": "Màn hình Samsung loại 1",
  "unit_price": 2200000,
  "current_stock": 16,
  "min_threshold": 8,
  "low_stock": 0
}
```

### Nhập kho

`POST /stock-receipts` nhận `{ "centerId": 1, "partId": 1, "quantity": 2, "note": "Nhập lô" }`. Trả `201` với mã giao dịch và tồn mới. `quantity` phải là số nguyên dương.

### Xuất kho

`POST /stock-issues` nhận `{ "centerId": 1, "partId": 1, "ticketId": 5001, "quantity": 1 }`. Xuất kho kiểm tra tồn và cập nhật tồn/lịch sử trong một transaction. Thiếu tồn trả `409 INSUFFICIENT_STOCK`; mã phiếu phải là số nguyên dương.

**Giới hạn hiện tại:** `ticketId` chỉ được lưu làm mã tham chiếu; hệ thống chưa truy vấn hay xác thực phiếu ở phân hệ bảo hành.

### Cảnh báo và lịch sử

- `GET /stock-alerts?centerId=1`: linh kiện có số lượng nhỏ hơn ngưỡng tối thiểu.
- `GET /stock-transactions?centerId=1&type=OUT`: lịch sử lọc theo trung tâm và/hoặc `IN`, `OUT`. Chưa hỗ trợ bộ lọc thời gian.

## Mã HTTP và lỗi

| HTTP | Ý nghĩa |
|---|---|
| 200 | Đọc hoặc cập nhật thành công |
| 201 | Tạo thành công |
| 204 | Xóa thành công |
| 400 | Dữ liệu hoặc ID không hợp lệ |
| 401 | Thiếu hoặc sai token |
| 404 | Không tìm thấy bản ghi |
| 409 | Trùng mã, bản ghi đang được tham chiếu hoặc không đủ tồn |
| 500 | Lỗi ngoài dự kiến |
