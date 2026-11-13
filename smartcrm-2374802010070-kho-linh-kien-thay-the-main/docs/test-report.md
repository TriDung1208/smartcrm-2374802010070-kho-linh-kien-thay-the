# Test Report – BT3 / checklist buổi 14

**Bản PDF để nộp:** [BT3_2374802010070_TranTriDung.pdf](./BT3_2374802010070_TranTriDung.pdf)

## Tóm tắt lần chạy

- **Ngày chạy:** 2026-11-13
- **Lệnh:** `npm test` (tại `src/backend`)
- **Môi trường:** Windows, Node.js `v24.21.0`, npm `11.19.0`
- **Tổng số test tự động:** 27
- **PASS:** 27
- **FAIL:** 0
- **Skipped / cancelled:** 0
- **Kết quả:** PASS

## Kết quả theo test case

Kết quả chạy mới nhất được lưu tại [test-results-bt3.txt](./evidence/test-results-bt3.txt): 27 PASS, 0 FAIL. Ảnh [test-suite-pass-17.png](./screenshots/test-suite-pass-17.png) là minh chứng của lần chạy cũ với 17 test, không đại diện cho lần chạy 27 test này.

| ID | Kết quả | Minh chứng |
|---|---|---|
| TC-01 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-02 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-03 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-04 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-05 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-06 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-07 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-08 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-09 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-10 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-11 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-12 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-13 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-14 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-15 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-16 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-17 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-18 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-19 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-20 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-21 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-22 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-23 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-24 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-25 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-26 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |
| TC-27 | PASS | [test-results-bt3.txt](./evidence/test-results-bt3.txt) |

## Đối chiếu 5 loại checklist

| Loại | Trạng thái | Căn cứ |
|---|---|---|
| Luồng đúng | Có | TC-01, TC-05, TC-08, TC-11, TC-16 |
| Biên | Có | TC-12, TC-16, TC-17, TC-20 |
| Dữ liệu sai | Có | TC-02, TC-07, TC-09, TC-13, TC-14, TC-15, TC-17, TC-18, TC-19 |
| Bảo mật / chất lượng dữ liệu | Có, unit và API integration test | TC-03, TC-04, TC-06, TC-07, TC-09, TC-10, TC-21–27 |
| Tái lập | Có, ở mức seed/test runner | TC-10; test chạy bằng một lệnh `npm test` |

## Minh chứng bổ sung và giới hạn

- [invalid-stock-input.png](./screenshots/invalid-stock-input.png): ảnh phản hồi API cho số lượng 0 và JSON sai; là minh chứng bổ sung, không cộng vào 27 test tự động.
- [stock-query-smoke-bt3.txt](./evidence/stock-query-smoke-bt3.txt): smoke test service trên SQLite tạm, xác nhận ID và loại giao dịch sai trả lỗi HTTP 400.
- [auth-role-cli-bt3.txt](./evidence/auth-role-cli-bt3.txt): xác minh tài khoản mới mặc định `WAREHOUSE` và CLI đổi được vai trò hai chiều.
- [docker-static-check-bt3.txt](./evidence/docker-static-check-bt3.txt): kiểm tra tĩnh Dockerfile/Compose; Docker build/run chưa thể xác minh do máy không có Docker CLI/Engine.
- [clean-snapshot-check-bt3.txt](./evidence/clean-snapshot-check-bt3.txt): Git archive sạch có đủ mã nguồn, dataset và cấu hình Docker; `npm test` đạt 27 PASS với dependency dùng lại từ máy phát triển.
- [inventory-screen.png](./screenshots/inventory-screen.png), [stock-issue-success.png](./screenshots/stock-issue-success.png), [backend-offline.png](./screenshots/backend-offline.png): ảnh màn hình chức năng hiện có, không được tính là test tự động.
- Không có test tích hợp HTTP cho mọi route, kiểm thử đồng thời/race condition, fuzzing, kiểm thử tải hoặc xác minh đầy đủ quyền truy cập từng API.
- Test tích hợp HTTP bao gồm đọc/ghi trung tâm, ghi nhóm lỗi và truy cập danh sách kỹ thuật viên theo vai trò; chưa bao phủ mọi route.
- Môi trường này không có Docker CLI/daemon nên chưa thể chạy `docker compose build/up` tại máy phát triển; Dockerfile/Compose được kiểm tra tĩnh, cần chạy lệnh Docker trong môi trường có Docker trước khi xác nhận build image.
- Lần chạy được ghi nhận dùng Node.js 24.21.0; chưa có bằng chứng chạy test trên Node.js 22.x.
- Đã chạy `npm test` trên Git archive sạch (27 PASS), xác nhận Dockerfile/Compose và CSV seed có trong snapshot; dependency được dùng lại từ máy phát triển qua `NODE_PATH`, chưa xác minh cài dependency bằng `npm ci` trong môi trường sạch.

## Lệnh tái chạy

```powershell
Set-Location src\backend
npm test
```
