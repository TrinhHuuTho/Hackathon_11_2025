## Ngôn ngữ

- Chúng tôi chấp nhận câu hỏi và yêu cầu bằng **mọi ngôn ngữ**.
- Tất cả các phản hồi và hướng dẫn sẽ được cung cấp bằng **tiếng Việt**.

## Bố cục Dự án

- Không quan tâm đến các tầng trong kiến trúc phần mềm backend của Spring Boot (Controller, Service, Repository, Entity).
- Chỉ tập trung vào các module và chức năng chính của dự án. Code bạn gen ra tập trung vào việc tạo ra chức năng đạt được mục đích của dự án.

## Thay đổi File

- **Không được phép thay đổi bất kỳ file nào mà không có yêu cầu rõ ràng hoặc sự đồng thuận từ trưởng nhóm/người phụ trách module đó.**
- Mọi thay đổi cần được xem xét cẩn thận và phải tuân thủ các quy ước coding style và kiến trúc đã đề ra.
- Luôn tạo một nhánh mới (branch) khi tôi muốn bạn thực hiện thay đổi. Điều này giúp dễ dàng theo dõi lịch sử thay đổi và đảm bảo rằng các thay đổi có thể được xem xét và kiểm tra trước khi hợp nhất vào nhánh chính.
- Hướng dẫn tôi cách quay lại code cũ nếu thay đổi của bạn không hoạt động như mong đợi.
- Luôn tạo một nhánh mới (branch) cho công việc của bạn và gửi Pull Request (PR) để được xem xét trước khi hợp nhất vào nhánh chính.

## Mục tiêu Dự án

- Tạo ra các chức năng liên quan đến quản lý khóa học, người dùng, và các tính năng liên quan đến giáo dục trực tuyến.
- Xử lý data json một cách linh hoạt khi nhận dữ liệu từ hệ thống FastAPI.
- Gợi ý viết các hàm để gọi FastAPI và xử lý dữ liệu trả về từ python linh hoạt

## Đảm bảo không để lộ thông tin nhạy cảm

- **Không commit các file chứa thông tin nhạy cảm:** Như khóa API, mật khẩu, hoặc thông tin cá nhân. Sử dụng biến môi trường (environment variables) để quản lý các thông tin này. Sau đó tạo file `.env.example` để hướng dẫn người dùng cách cấu hình biến môi trường.
- **Kiểm tra kỹ lưỡng trước khi commit:** Đảm bảo rằng không có thông tin nhạy cảm nào bị lộ trong các commit. Sử dụng các công cụ như `git-secrets` để kiểm tra các commit trước khi đẩy lên repository.

## Quy ước commit

- Sử dụng [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) để đảm bảo lịch sử commit rõ ràng và dễ hiểu.
- Ví dụ:
  - `feat: Thêm tính năng đăng ký người dùng`
  - `fix: Sửa lỗi không hiển thị danh sách khóa học`
  - `docs: Cập nhật tài liệu API cho endpoint đăng nhập`
  - `style: Cải thiện giao diện trang chủ`
  - `refactor: Tối ưu hóa logic xử lý thanh toán`

---
