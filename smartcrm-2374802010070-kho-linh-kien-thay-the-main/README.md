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
```bash
cd src/backend
npm install
npm run migrate
npm run seed
npm start
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