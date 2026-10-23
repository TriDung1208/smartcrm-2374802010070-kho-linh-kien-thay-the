# Smart CRM – Quản lý kho linh kiện thay thế

**Sinh viên:** Trần Trí Dũng – MSSV: 2374802010070
**Track:** SE
**Học phần:** Chuyên đề Tốt nghiệp 1 – Trường ĐH Văn Lang

## 1. Mô tả bài toán
Theo dõi tồn kho linh kiện theo trung tâm, xuất linh kiện cho phiếu bảo hành
(có kiểm tra tồn kho trước khi xuất), cảnh báo khi tồn dưới ngưỡng, và ghi
nhận nhập kho.

## 2. Yêu cầu môi trường
| Thành phần | Yêu cầu |
|---|---|
| Hệ điều hành | Windows 10/11, Ubuntu 22.04 hoặc macOS |
| Node.js | 18.x hoặc 20.x |
| npm | 9.x trở lên |
| Database | SQLite 3 (dự phòng) hoặc PostgreSQL 14+ |
| Công cụ hỗ trợ | Git, curl/Postman để test API |

## 3. Phạm vi
- Làm: ghi nhận nhập kho, xem tồn kho theo trung tâm, xuất linh kiện cho
  phiếu bảo hành (validate không xuất quá tồn), cảnh báo khi tồn dưới
  ngưỡng, xem lịch sử giao dịch
- Không làm: quản lý mua hàng/nhà cung cấp, kế toán/giá vốn kho, quản lý
  đa kho tổng ngoài trung tâm dịch vụ

## 4. Công nghệ sử dụng
| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js + Express |
| Database | SQLite (dự phòng), PostgreSQL-compatible nếu triển khai production |
| API test | curl / Postman |

## 5. Cấu trúc thư mục
```text
├── docs/
│   ├── ai-disclosure.md
│   ├── api-contract.md
│   ├── srs.md
│   ├── thay-doi-thiet-ke.md
│   ├── Untitled Diagram.drawio
│   └── diagrams/
├── src/
│   ├── frontend/
│   │   ├── api/
│   │   ├── components/
│   │   ├── app.js
│   │   └── index.html
│   └── backend/
│       ├── database/
│       ├── src/
│       ├── package.json
│       ├── server.js
│       └── data/
├── tests/
├── .env.example
├── .gitignore
├── README.md
└── .env
```

## 6. Trạng thái hiện tại của hệ thống ở buổi 8
- Đã hoàn thiện phần thiết kế cạnh nghề nghiệp: SRS, Use Case, API contract, phụ lục AI và bảng thay đổi theo phản hồi BT1.
- Đã dựng module backend đầu tiên cho luồng L5 – kho linh kiện thay thế theo kiến trúc 3 lớp: routes → service → repository.
- Đã tạo migration SQLite và seed dữ liệu danh mục từ bộ mẫu `service_centers`, `issue_categories`, `technicians` và `parts`.
- Đã triển khai các endpoint chính: tra cứu tồn kho, cảnh báo tồn thấp, nhập kho, xuất kho và xem lịch sử giao dịch.
- Đã chạy kiểm thử bằng `curl` với kết quả hợp lệ và lưu minh chứng trong thư mục `docs/`.
- Tình trạng: đã đạt rõ thành phần core đầu tiên của Sprint 1, sẵn sàng cho mở rộng các module tiếp theo.

## 7. Hướng dẫn cài đặt & chạy

Từ thư mục gốc của repository, cài đặt và chạy backend (backend cũng phục vụ giao diện):

```bash
cd src/backend
npm install
npm run migrate
npm run seed
npm start
```

Mở `http://localhost:3000` để dùng giao diện kho; API mặc định dùng `/api/v1`.
Nếu API chạy ở địa chỉ khác, đặt `API_BASE_URL` trong `.env` (ví dụ
`http://localhost:3000/api/v1`). Chỉ dùng `.env.example` làm mẫu và không commit
`.env`. Có thể đặt `SMARTCRM_DB_PATH` để dùng một tệp SQLite riêng thay cho
`src/backend/data/smartcrm.db`.

Giao diện kho theo wireframe gồm ba màn hình: tồn kho, xuất linh kiện và nhập
kho/lịch sử giao dịch. Tìm kiếm tồn kho chạy trên danh sách đã tải từ API; lọc
ngày, loại và linh kiện trong lịch sử cũng áp dụng trên dữ liệu lịch sử tải về.

Lưu ý phạm vi: backend hiện chưa có xác thực người dùng hoặc module phiếu bảo
hành. Giao diện gửi token nếu đã có trong `localStorage`, xóa token khi API trả
401; khi xuất kho, mã phiếu được kiểm tra là số nguyên dương và lưu làm tham
chiếu, nhưng chưa thể xác minh phiếu tồn tại.

Chạy kiểm thử quy tắc nghiệp vụ từ thư mục `src/backend`:

```bash
npm test
```

## 8. Khai báo sử dụng công cụ AI
| Công cụ | Dùng vào việc gì | Cách tự kiểm chứng |
|---|---|---|
| GitHub Copilot / AI Assistant | Hỗ trợ rà soát chặt chẽ giữa SRS, sơ đồ, ERD và phản hồi BT1; đề xuất sửa inconsistency; định dạng tài liệu | Mọi thay đổi đều được kiểm lại bằng logic nghiệp vụ và sửa theo phản hồi của giảng viên |
| Không có công cụ AI nào thay thế trách nhiệm kỹ thuật của người làm | Chỉ hỗ trợ tăng tốc độ đọc, soát lỗi, và cấu trúc lại bản ghi | Người thực hiện tự xác nhận kết quả trước khi commit |

## 9. Commit và kiểm tra
- Commit thiết kế: `docs: điều chỉnh thiết kế theo phản hồi BT1`
- Commit module core: `feat: build stock module core for track se`
- Đã thực hiện kiểm tra API bằng curl và lưu hình ảnh kết quả trong `docs/`.