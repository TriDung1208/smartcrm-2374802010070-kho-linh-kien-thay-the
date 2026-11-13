# Minh chứng ảnh chụp

Các ảnh được sao chép từ minh chứng đã có trong `docs/evidence/` để dùng theo đường dẫn `docs/screenshots/` của checklist buổi 14.

- `test-suite-pass-17.png`: ảnh của lần chạy cũ gồm 17 test PASS, 0 FAIL; lần chạy hiện tại 27 test được ghi trong [`test-results-bt3.txt`](../evidence/test-results-bt3.txt).
- `invalid-stock-input.png`: API từ chối quantity bằng 0 và JSON không hợp lệ.
- `inventory-screen.png`: màn hình tra cứu tồn kho.
- `stock-issue-success.png`: màn hình sau thao tác xuất kho thành công.
- `backend-offline.png`: giao diện báo backend không khả dụng.
- Minh chứng Docker: khi có Docker Engine, chạy theo phần Docker trong README và lưu ảnh `docker compose ps` hiển thị service healthy cùng phản hồi `/health`.

Kết quả chạy lại và các giới hạn được ghi trong [Test Report](../test-report.md).
