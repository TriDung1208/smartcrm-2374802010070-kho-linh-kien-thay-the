# Bảng thay đổi thiết kế theo phản hồi BT1

| Mã | Điểm góp ý | Quyết định | Lý do | Ảnh hưởng |
|---|---|---|---|---|
| TD-01 | Sơ đồ Use Case đánh số UC01–UC07 khác với bảng UC1–UC9 trong văn bản | SỬA | Đảm bảo tính nhất quán giữa sơ đồ, SRS và ma trận truy vết; mã UC cần đồng bộ theo cùng một chuẩn | Bảng Use Case, sơ đồ, và tài liệu tham chiếu được đồng nhất, tránh nhầm lẫn khi đọc và đánh giá |
| TD-02 | Actor ngoài trên sơ đồ là Module Phiếu bảo hành nhưng văn bản ghi Hệ thống thời gian/sự kiện | SỬA | Actor trong sơ đồ cần phản ánh đúng vai trò nghiệp vụ và không tạo ra “actor giả” ngoài hệ thống | Cập nhật tên actor và ràng buộc giữa hệ thống, nhân viên kho và quản lý trong mô tả use case |
| TD-03 | ERD vẽ 6 bảng nhưng DDL có 8 bảng (thêm employee, technician) | SỬA | Mô hình dữ liệu phải khớp với DDL và dữ liệu danh mục mẫu; không được để ERD lệch so với implementation | ERD và DDL đồng bộ; dữ liệu danh mục và phần quản lý kho dễ triển khai hơn |
| TD-04 | Wireframe M2 hiển thị “Đơn giá” nhưng mô hình dữ liệu không có cột này | SỬA | “Đơn giá” có thể gây hiểu nhầm giữa màn hình hiển thị và thực thể dữ liệu; cần loại bỏ hoặc đổi sang giá trị hợp lệ | Màn hình, mô hình dữ liệu và yêu cầu nghiệp vụ được thống nhất |
| TD-05 | Lập luận 2 (NFR2) không nêu đánh đổi | SỬA | NFR cần nêu rõ quyết định thiết kế và trade-off giữa độ an toàn, độ phức tạp và hiệu suất | NFR2 rõ ràng hơn, dễ xác minh và bảo vệ trong buổi phản biện |
| TD-06 | Có 9 User Story, vượt mức 5–7 | SỬA | Để phù hợp giới hạn số lượng và tránh thừa chức năng không đủ trọng tâm, cần giảm xuống mức tối ưu | SRS tập trung hơn, dễ theo dõi và rà soát trong Sprint 1 |
| TD-07 | Link GitHub nằm ở trang 2, không ở trang bìa; PDF có 18 trang trắng | GIỮ | Là vấn đề trình bày tài liệu, không phải lỗi nghiệp vụ; vẫn có thể sửa khi biên tập cuối, nhưng không làm thay đổi logic thiết kế | Tài liệu định dạng được cải thiện nhưng không ảnh hưởng tới chức năng hệ thống |
| TD-08 | Thiếu phụ lục AI và dòng cam kết | SỬA | Đây là phụ lục bắt buộc theo yêu cầu bài tập; cần được bổ sung rõ ràng ở repo và trong SRS | Tài liệu đáp ứng chuẩn nộp, tăng tính minh bạch và trách nhiệm khoa học |
| TD-09 | Repo thiếu docs/ với các file .drawio gốc | SỬA | Cần lưu các bản vẽ nguồn trong repo để thuận tiện reviews và maintenance | Hệ thống tài liệu vẽ được lưu trữ bền vững trong repo |
| TD-10 | PDF quá nhiều trang trắng và thiếu thống nhất giữa các tài liệu | SỬA | Nội dung cần được nén và sắp xếp lại để không tạo khoảng trống không cần thiết | Trình bày chuyên nghiệp hơn và dễ theo dõi khi giao cho người chấm |
