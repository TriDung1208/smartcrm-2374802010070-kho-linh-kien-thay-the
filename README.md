# Smart CRM — L5 Kho linh kiện thay thế

Mã nguồn và tài liệu của dự án nằm trong [`smartcrm-2374802010070-kho-linh-kien-thay-the-main/`](./smartcrm-2374802010070-kho-linh-kien-thay-the-main/). Phạm vi BT3 gồm kiểm thử, sửa lỗi, phân quyền và đóng gói Docker cho phân hệ quản lý kho linh kiện.

## Chạy nhanh bằng Docker

Mở PowerShell tại thư mục dự án:

```powershell
Set-Location smartcrm-2374802010070-kho-linh-kien-thay-the-main
Copy-Item .env.docker.example .env
$secret = node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
Set-Content -Path .env -Value "AUTH_TOKEN_SECRET=$secret" -Encoding ASCII
docker compose up --build -d
docker compose ps
Invoke-RestMethod http://localhost:3000/health
```

Yêu cầu Docker Desktop/Engine và Docker Compose. Chi tiết chạy, kiểm thử, tài khoản và phân quyền xem [README của dự án](./smartcrm-2374802010070-kho-linh-kien-thay-the-main/README.md).

## Báo cáo

- [Báo cáo BT3 (DOCX)](./smartcrm-2374802010070-kho-linh-kien-thay-the-main/docs/BT3_2374802010070_TranTriDung.docx)
- [Báo cáo BT3 (PDF để nộp)](./smartcrm-2374802010070-kho-linh-kien-thay-the-main/docs/BT3_2374802010070_TranTriDung.pdf)
- [Test Plan](./smartcrm-2374802010070-kho-linh-kien-thay-the-main/docs/test-plan.md)
- [Test Report](./smartcrm-2374802010070-kho-linh-kien-thay-the-main/docs/test-report.md)
