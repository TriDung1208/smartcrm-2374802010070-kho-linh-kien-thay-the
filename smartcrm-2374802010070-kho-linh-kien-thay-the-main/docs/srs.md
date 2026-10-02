# SRS rút gọn – Smart CRM – L5 Kho linh kiện thay thế

## 1. Tổng quan

### 1.1 Mục đích
Tài liệu này đặc tả yêu cầu phần mềm cho luồng **L5 – Kho linh kiện thay thế** của Smart CRM – Mekong Mobile. Hệ thống hỗ trợ nhân viên kho và quản lý trung tâm theo dõi tồn kho, nhập linh kiện, xuất linh kiện gắn với phiếu bảo hành, kiểm soát không xuất vượt tồn, cảnh báo tồn thấp và tra cứu lịch sử giao dịch.

### 1.2 Phạm vi
**Trong phạm vi:** quản lý tồn kho theo trung tâm; tra cứu linh kiện; nhập kho; xuất linh kiện cho phiếu bảo hành; kiểm tra tồn trước khi xuất; cảnh báo khi tồn dưới ngưỡng tối thiểu; xem lịch sử giao dịch.

**Ngoài phạm vi:** mua hàng từ nhà cung cấp, kế toán/giá vốn, quản lý vận chuyển, sửa chữa thiết bị và xử lý nội dung phiếu bảo hành ngoài phần liên kết linh kiện.

### 1.3 Vai trò
- **Nhân viên kho:** thực hiện nhập, xuất và tra cứu tồn.
- **Quản lý trung tâm:** xem tồn, lịch sử và theo dõi cảnh báo.
- **Hệ thống:** kiểm tra quy tắc nghiệp vụ, cập nhật tồn và phát cảnh báo.

---

## 2. User Stories và ưu tiên MoSCoW

| Mã | User Story | MoSCoW |
|---|---|---|
| US1 | Là **nhân viên kho**, tôi muốn **tra cứu tồn kho của linh kiện theo trung tâm**, để **biết số lượng hiện có trước khi xử lý yêu cầu**. | MUST |
| US2 | Là **nhân viên kho**, tôi muốn **nhập số lượng linh kiện vào kho**, để **cập nhật chính xác lượng tồn sau khi nhận hàng**. | MUST |
| US3 | Là **nhân viên kho**, tôi muốn **xuất linh kiện và gắn với phiếu bảo hành**, để **có thể cấp đúng linh kiện cho việc sửa chữa**. | MUST |
| US4 | Là **nhân viên kho**, tôi muốn **hệ thống kiểm tra số lượng tồn trước khi xuất**, để **không phát sinh tồn kho âm**. | SHOULD |
| US5 | Là **quản lý trung tâm**, tôi muốn **nhận cảnh báo khi tồn kho thấp hơn ngưỡng tối thiểu**, để **chủ động bổ sung linh kiện**. | SHOULD |
| US6 | Là **quản lý trung tâm**, tôi muốn **xem lịch sử nhập/xuất linh kiện**, để **kiểm tra và đối soát biến động tồn kho**. | SHOULD |
| US7 | Là **nhân viên kho**, tôi muốn **xem thông tin chi tiết của một linh kiện**, để **xác định đúng mã và đơn vị trước khi thao tác**. | COULD |
| US8 | Là **quản lý trung tâm**, tôi muốn **lọc lịch sử giao dịch theo khoảng thời gian và loại giao dịch**, để **tìm nhanh các biến động cần kiểm tra**. | COULD |
| US9 | Là **nhân viên kho**, tôi muốn **hủy thao tác xuất chưa xác nhận**, để **sửa lại thông tin trước khi ghi nhận giao dịch**. | COULD |

### Tiêu chí chấp nhận – các Story MUST

#### US1 – Tra cứu tồn kho
- **AC1:** Given nhân viên kho đã chọn trung tâm và mã linh kiện hợp lệ, When thực hiện tra cứu, Then hệ thống trả về số lượng tồn hiện tại và ngưỡng tối thiểu.
- **AC2:** Given mã linh kiện không tồn tại, When thực hiện tra cứu, Then hệ thống thông báo không tìm thấy linh kiện và không tạo giao dịch.
- **AC3 – ngoại lệ:** Given linh kiện có tồn bằng 0, When thực hiện tra cứu, Then hệ thống vẫn trả về bản ghi với tồn = 0 và trạng thái cần bổ sung.

#### US2 – Nhập kho
- **AC1:** Given linh kiện tồn tại và số lượng nhập là số nguyên dương, When xác nhận nhập, Then hệ thống tăng tồn đúng bằng số lượng nhập và tạo giao dịch IN.
- **AC2:** Given số lượng nhập nhỏ hơn hoặc bằng 0, When xác nhận nhập, Then hệ thống từ chối và yêu cầu nhập lại.
- **AC3 – ngoại lệ:** Given linh kiện không tồn tại tại trung tâm, When xác nhận nhập, Then hệ thống không tạo giao dịch và trả lỗi nghiệp vụ.

#### US3 – Xuất linh kiện cho phiếu bảo hành
- **AC1:** Given phiếu bảo hành hợp lệ, linh kiện hợp lệ và tồn đủ, When xác nhận xuất, Then hệ thống giảm tồn, tạo giao dịch OUT và liên kết với phiếu bảo hành.
- **AC2:** Given phiếu bảo hành không tồn tại hoặc không hợp lệ, When xác nhận xuất, Then hệ thống từ chối giao dịch.
- **AC3 – ngoại lệ:** Given tồn kho nhỏ hơn số lượng yêu cầu, When xác nhận xuất, Then hệ thống từ chối toàn bộ giao dịch và không làm thay đổi tồn kho.

#### US4 – Kiểm tra không xuất vượt tồn
- **AC1:** Given tồn hiện tại là Q và số lượng yêu cầu <= Q, When kiểm tra, Then giao dịch được phép tiếp tục.
- **AC2:** Given số lượng yêu cầu > Q, When kiểm tra, Then hệ thống trả lỗi INSUFFICIENT_STOCK và không cập nhật tồn.
- **AC3 – ngoại lệ:** Given đồng thời có hai yêu cầu xuất cùng một linh kiện, When cả hai cùng được xử lý, Then hệ thống phải bảo đảm không làm tồn kho âm bằng cơ chế kiểm soát giao dịch/đồng thời.

---

## 3. Use Case

### 3.1 Danh sách Use Case

| Mã | Use Case | Actor chính | Liên quan |
|---|---|---|---|
| UC01 | Tra cứu tồn kho | Nhân viên kho | US1 |
| UC02 | Nhập linh kiện vào kho | Nhân viên kho | US2 |
| UC03 | Xuất linh kiện cho phiếu bảo hành | Nhân viên kho | US3, US4 |
| UC04 | Kiểm tra tồn trước khi xuất | Hệ thống | US4 |
| UC05 | Cảnh báo tồn dưới ngưỡng | Hệ thống / Quản lý | US5 |
| UC06 | Xem lịch sử giao dịch | Quản lý trung tâm | US6, US8 |
| UC07 | Xem chi tiết linh kiện | Nhân viên kho | US7 |
| UC08 | Hủy thao tác xuất chưa xác nhận | Nhân viên kho | US9 |

### 3.2 Đặc tả Use Case quan trọng nhất – UC03 Xuất linh kiện cho phiếu bảo hành

**Mục tiêu:** ghi nhận việc cấp linh kiện cho một phiếu bảo hành hợp lệ mà không làm tồn kho âm.

**Actor chính:** Nhân viên kho.

**Tiền điều kiện:**
1. Nhân viên kho đã đăng nhập.
2. Phiếu bảo hành tồn tại và có trạng thái cho phép cấp linh kiện.
3. Linh kiện tồn tại tại trung tâm.

**Hậu điều kiện thành công:**
1. Tồn kho giảm đúng số lượng xuất.
2. Một giao dịch OUT được tạo.
3. Giao dịch được liên kết với phiếu bảo hành.

**Luồng chính:**
1. Nhân viên kho chọn chức năng xuất linh kiện.
2. Nhân viên nhập/chọn mã phiếu bảo hành.
3. Nhân viên chọn linh kiện và trung tâm.
4. Nhân viên nhập số lượng xuất.
5. Hệ thống kiểm tra phiếu bảo hành và linh kiện.
6. Hệ thống kiểm tra tồn kho theo UC04.
7. Hệ thống ghi nhận giao dịch OUT.
8. Hệ thống giảm tồn kho.
9. Hệ thống trả kết quả thành công và mã giao dịch.

**Luồng ngoại lệ:**
- **E1 tại bước 5:** Phiếu bảo hành không hợp lệ → dừng xử lý, trả lỗi `INVALID_TICKET`.
- **E2 tại bước 6:** Tồn kho không đủ → dừng xử lý, trả lỗi `INSUFFICIENT_STOCK`, tồn kho không thay đổi.
- **E3 tại bước 6:** Số lượng xuất <= 0 → dừng xử lý, trả lỗi `INVALID_QUANTITY`.
- **E4 tại bước 7-8:** Lỗi ghi nhận giao dịch hoặc lỗi cập nhật tồn → rollback transaction, không để giao dịch dở dang.

---

## 4. Yêu cầu chức năng và phi chức năng

### 4.1 Functional Requirements

| Mã FR | Yêu cầu |
|---|---|
| FR01 | Hệ thống cho phép tra cứu tồn kho theo trung tâm và linh kiện. |
| FR02 | Hệ thống cho phép nhập linh kiện và cập nhật tồn. |
| FR03 | Hệ thống cho phép xuất linh kiện gắn với phiếu bảo hành. |
| FR04 | Hệ thống kiểm tra tồn trước khi xuất và từ chối nếu không đủ. |
| FR05 | Hệ thống cảnh báo khi tồn nhỏ hơn ngưỡng tối thiểu. |
| FR06 | Hệ thống lưu và hiển thị lịch sử giao dịch nhập/xuất. |
| FR07 | Hệ thống cho phép xem chi tiết linh kiện. |
| FR08 | Hệ thống cho phép lọc lịch sử theo thời gian và loại giao dịch. |
| FR09 | Hệ thống cho phép hủy thao tác xuất chưa xác nhận. |

### 4.2 Non-functional Requirements

| Mã | Yêu cầu |
|---|---|
| NFR01 | API phải trả phản hồi lỗi nghiệp vụ bằng HTTP status phù hợp và JSON có mã lỗi. |
| NFR02 | Thao tác xuất kho phải có tính nguyên tử: cập nhật tồn và tạo giao dịch thành công cùng nhau hoặc cùng rollback. |
| NFR03 | Hệ thống phải ngăn tồn kho âm trong các giao dịch đồng thời. |
| NFR04 | Dữ liệu giao dịch phải lưu được thời gian, loại giao dịch, số lượng và tác nhân thực hiện. |
| NFR05 | API phải kiểm tra dữ liệu đầu vào ở server, không chỉ dựa vào giao diện. |

---

## 5. API và quy tắc nghiệp vụ tóm tắt

| Endpoint | Method | Mục đích |
|---|---|---|
| `/api/v1/stocks` | GET | Tra cứu tồn kho |
| `/api/v1/stock-receipts` | POST | Nhập kho |
| `/api/v1/stock-issues` | POST | Xuất kho gắn phiếu bảo hành |
| `/api/v1/parts/{partId}` | GET | Xem chi tiết linh kiện |
| `/api/v1/stock-transactions` | GET | Xem/lọc lịch sử giao dịch |
| `/api/v1/stock-alerts` | GET | Xem cảnh báo tồn thấp |

Quy tắc nghiệp vụ quan trọng:
1. `quantity` phải là số nguyên dương.
2. Xuất kho chỉ được thực hiện khi phiếu bảo hành hợp lệ.
3. Không được xuất quá số lượng tồn khả dụng.
4. Giao dịch OUT phải cập nhật tồn và tạo lịch sử trong cùng transaction.
5. Khi `currentStock < minThreshold`, hệ thống tạo/trả trạng thái cảnh báo.

---

## 6. Ma trận truy vết

| FR | US | Use Case | MoSCoW |
|---|---|---|---|
| FR01 | US1 | UC01 | MUST |
| FR02 | US2 | UC02 | MUST |
| FR03 | US3 | UC03 | MUST |
| FR04 | US4 | UC04, UC03 | SHOULD |
| FR05 | US5 | UC05 | SHOULD |
| FR06 | US6 | UC06 | SHOULD |
| FR07 | US7 | UC07 | COULD |
| FR08 | US8 | UC06 | COULD |
| FR09 | US9 | UC08 | COULD |

### Kiểm tra INVEST
- **Independent:** mỗi story tập trung vào một giá trị/chức năng có thể bàn giao.
- **Negotiable:** mô tả mục tiêu và giá trị, không khóa cứng cách triển khai.
- **Valuable:** mỗi story mang lại giá trị cho nhân viên kho hoặc quản lý.
- **Estimable:** phạm vi đủ rõ để ước lượng.
- **Small:** mỗi story có phạm vi giới hạn trong L5.
- **Testable:** story MUST có tiêu chí Given-When-Then; các story còn lại có thể bổ sung AC khi triển khai.
