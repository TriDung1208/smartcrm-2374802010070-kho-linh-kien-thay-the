# SE Track – API Contract: L5 Kho linh kiện thay thế

## 1. Quy ước chung

- Base URL: `/api/v1`
- Content-Type: `application/json`
- ID dùng kiểu số nguyên hoặc UUID tùy implementation; ví dụ dưới đây dùng integer để dễ đọc.
- Thời gian dùng ISO-8601.
- Lỗi trả về JSON thống nhất:

```json
{
  "code": "INSUFFICIENT_STOCK",
  "message": "Stock is not sufficient",
  "details": {}
}
```

## 2. Tra cứu tồn kho

### GET `/api/v1/stocks?centerId=1&partId=101`

Response `200 OK`:

```json
{
  "centerId": 1,
  "partId": 101,
  "partCode": "BAT-IPH-13",
  "partName": "Battery iPhone 13",
  "currentStock": 12,
  "minThreshold": 5,
  "lowStock": false
}
```

## 3. Nhập kho

### POST `/api/v1/stock-receipts`

Request:

```json
{
  "centerId": 1,
  "partId": 101,
  "quantity": 20,
  "note": "Nhập lô tháng 10"
}
```

Response `201 Created`:

```json
{
  "transactionId": 9001,
  "type": "IN",
  "centerId": 1,
  "partId": 101,
  "quantity": 20,
  "currentStock": 32
}
```

## 4. Xuất linh kiện cho phiếu bảo hành

### POST `/api/v1/stock-issues`

Request:

```json
{
  "centerId": 1,
  "partId": 101,
  "ticketId": 5001,
  "quantity": 2,
  "note": "Cấp linh kiện sửa chữa"
}
```

Response `201 Created`:

```json
{
  "transactionId": 9002,
  "type": "OUT",
  "centerId": 1,
  "partId": 101,
  "ticketId": 5001,
  "quantity": 2,
  "currentStock": 10
}
```

Response khi không đủ tồn – `409 Conflict`:

```json
{
  "code": "INSUFFICIENT_STOCK",
  "message": "Available stock is 1 but requested quantity is 2",
  "details": {
    "available": 1,
    "requested": 2
  }
}
```

## 5. Xem chi tiết linh kiện

### GET `/api/v1/parts/101`

Response `200 OK`:

```json
{
  "id": 101,
  "code": "BAT-IPH-13",
  "name": "Battery iPhone 13",
  "unit": "piece",
  "minThreshold": 5,
  "active": true
}
```

## 6. Lịch sử giao dịch

### GET `/api/v1/stock-transactions?centerId=1&type=OUT&from=2026-10-01&to=2026-10-02`

Response `200 OK`:

```json
{
  "items": [
    {
      "transactionId": 9002,
      "type": "OUT",
      "partId": 101,
      "ticketId": 5001,
      "quantity": 2,
      "createdAt": "2026-10-02T10:30:00+07:00"
    }
  ],
  "total": 1
}
```

## 7. Cảnh báo tồn thấp

### GET `/api/v1/stock-alerts?centerId=1`

Response `200 OK`:

```json
{
  "items": [
    {
      "partId": 101,
      "partCode": "BAT-IPH-13",
      "currentStock": 3,
      "minThreshold": 5,
      "status": "LOW_STOCK"
    }
  ]
}
```

## 8. HTTP Status Code

| Status | Ý nghĩa |
|---|---|
| 200 | Truy vấn thành công |
| 201 | Tạo giao dịch thành công |
| 400 | Request sai định dạng/validation |
| 404 | Không tìm thấy linh kiện, trung tâm hoặc phiếu |
| 409 | Xung đột nghiệp vụ, ví dụ không đủ tồn |
| 500 | Lỗi hệ thống ngoài dự kiến |

## 9. Bảng validation

| Field | Rule | Error |
|---|---|---|
| `centerId` | Bắt buộc, số nguyên dương | `INVALID_CENTER_ID` |
| `partId` | Bắt buộc, số nguyên dương | `INVALID_PART_ID` |
| `ticketId` | Bắt buộc đối với xuất kho | `INVALID_TICKET_ID` |
| `quantity` | Bắt buộc, integer > 0 | `INVALID_QUANTITY` |
| `type` | Chỉ `IN` hoặc `OUT` | `INVALID_TRANSACTION_TYPE` |
| `from/to` | ISO date hợp lệ; from <= to | `INVALID_DATE_RANGE` |
| Xuất kho | quantity <= currentStock | `INSUFFICIENT_STOCK` |
| Phiếu bảo hành | Phải tồn tại và hợp lệ | `INVALID_TICKET` |

## 10. Quy tắc transaction

Đối với POST `/stock-issues`, hệ thống phải thực hiện kiểm tra tồn và cập nhật tồn trong transaction. Nếu tạo lịch sử giao dịch hoặc cập nhật tồn thất bại thì rollback toàn bộ thao tác, tránh tình trạng đã tạo giao dịch nhưng tồn chưa giảm hoặc ngược lại.
