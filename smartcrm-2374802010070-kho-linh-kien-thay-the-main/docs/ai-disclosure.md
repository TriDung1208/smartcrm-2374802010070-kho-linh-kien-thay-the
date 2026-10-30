# Khai báo sử dụng AI – BT2

Tôi có sử dụng GitHub Copilot / AI assistant trong VS Code để hỗ trợ rà soát checklist Buổi 12, đề xuất và triển khai một số thay đổi mã nguồn/tài liệu, cũng như bổ sung kiểm thử. AI không được dùng để thay thế việc tự hiểu và kiểm chứng sản phẩm.

| Công cụ | Việc được hỗ trợ | Tệp/hàm liên quan | Cách kiểm chứng |
|---|---|---|---|
| GitHub Copilot / AI assistant trong VS Code | Đối chiếu yêu cầu track SE và rà soát setup | `README.md`, `docs/srs.md`, `docs/api-contract.md` | So sánh từng lệnh cài/chạy và endpoint với script, route thực tế |
| GitHub Copilot / AI assistant trong VS Code | Bổ sung CRUD, validation và ngăn xóa trung tâm đang được dùng | `serviceCenterService.js` (`createServiceCenter`, `updateServiceCenter`, `deleteServiceCenter`); `issueCategoryService.js` (`createIssueCategory`, `updateIssueCategory`, `deleteIssueCategory`); các repository/routes tương ứng | `npm test`; kiểm thử CRUD, dữ liệu sai, mã trùng và bản ghi đang tham chiếu |
| GitHub Copilot / AI assistant trong VS Code | Làm seed chạy lặp an toàn và dùng được từ CLI | `database/seed.js` (`seedCatalogData`); `database/migrations/initDatabase.js` (`initDatabase`) | Chạy migrate, seed lặp và so sánh số dòng; test seed idempotent |
| GitHub Copilot / AI assistant trong VS Code | Tách máy chủ giao diện để minh họa lỗi backend rõ ràng | `src/frontend/server.js`; `src/frontend/api/client.js` | Mở trang khi backend tắt; xác nhận trang vẫn tải và API trả thông báo backend không khả dụng |
| GitHub Copilot / AI assistant trong VS Code | Soạn nhật ký lỗi, thay đổi thiết kế và khai báo AI | `docs/bug-log.md`, `docs/thay-doi-thiet-ke.md`, `docs/ai-disclosure.md` | Đối chiếu từng nội dung với thay đổi và kết quả kiểm thử thực tế |

Người thực hiện cần tự đọc lại mã nguồn, xác nhận ảnh minh chứng và chỉ nộp nội dung mà mình có thể giải thích. Bảng này khai báo phần AI đã hỗ trợ trong phiên hoàn thiện BT2; người nộp chịu trách nhiệm rà soát thông tin cá nhân và xác nhận trước khi nộp.
