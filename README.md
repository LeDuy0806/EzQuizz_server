<br />
<div align="center">
  <h3 align="center">EzQuiz Server - Hướng dẫn API</h3>

  <h2 align="center">
    Quizzes là công cụ hữu ích cải thiện hiệu quả học tập và mang lại sự hứng thú cho quá trình giảng dạy và học tập.
  </h2>
</div>

![EzQuiz Server](https://raw.githubusercontent.com/LeDuy0806/EzQuiz-mobile/main/src/assets/images/logo.png)

Quizzes là một ứng dụng học tập trực tuyến nhằm tạo ra một môi trường học tập tương tác và thú vị cho giáo viên và học sinh, sinh viên. Với Quizzes, giáo viên có thể tạo ra các bài kiểm tra đang dạng. Học sinh tham gia vào các trò chơi trực tuyến và trả lời câu hỏi trong thời gian thực. Ứng dụng giúp đánh giá kiến thức của người dùng, tăng cường sự tham gia và động lực học tập. Việc tự động chấm điểm giúp giáo viên tiết kiệm thời gian và tập trung vào hỗ trợ học sinh.

## Getting Started

Đây là tài liệu hướng dẫn cho API của EzQuiz Server. EzQuiz Server là thành phần backend của ứng dụng EzQuiz, cho phép người dùng tham gia vào trò chơi câu hỏi trực tuyến và kiểm tra kiến thức của mình. Server này được xây dựng bằng Node.js, Express và MongoDB.

## Yêu cầu hệ thống

-   [Node.js](https://nodejs.org/en/) (phiên bản 18 trở lên)
-   [MongoDB](https://www.mongodb.com/) (phiên bản 6 trở lên)

### Installation

1. Clone the repo

```
   git clone https://github.com/LeDuy0806/EzQuizz_server.git
```

2. Install NPM packages

```
   yarn
```

## Cấu hình

1. Tạo tệp tin `.env` trong thư mục gốc của dự án.
2. Đặt các biến môi trường sau trong tệp tin `.env`
3. Add .env file:

```
   PORT = 4000
   CONNECTION_STRING = ""(Liên hệ với chúng tôi để được cung cấp database)
   EXPRISES_TIME= '24h'
   ACCESS_TOKEN_SECERT = 'jwttoken123'
   REFRESH_TOKEN_SECERT = 'jwtrefreshtoken123'
```

## Sử dụng

1. Khởi động server API:

```
yarn start
```

2. Server API sẽ chạy tại `http://localhost:4000` (hoặc cổng đã chỉ định trong file .env).
3. Gắn API vào ứng dụng [EzQuiz Mobile](https://github.com/LeDuy0806/EzQuiz-mobile)

## Các Endpoint API

Dưới đây là danh sách các Endpoint API có sẵn:

-   `POST /register`: Đăng ký người dùng mới.
-   `POST /registerMail`: Gửi email xác nhận đăng ký.
-   `POST /login`: Đăng nhập người dùng.
-   `POST /refreshtoken`: Yêu cầu mã thông báo làm mới.
-   `POST /logout/:id`: Đăng xuất người dùng.
-   `GET /current`: Lấy thông tin người dùng hiện tại.
-   `GET /verify-email`: Xác nhận email.
-   `GET /generateOTP`: Tạo mã OTP ngẫu nhiên.
-   `GET /verifyOTP`: Xác nhận mã OTP.
-   `PUT /changeEmail`: Tạo mã OTP ngẫu nhiên để thay đổi email.
-   `PUT /resetPassword`: Đặt lại mật khẩu.
-   `PUT /resetEmail`: Thay đổi email sau khi xác nhận OTP.
-   `GET /api/questions`: Lấy danh sách tất cả các câu hỏi.
-   `GET /api/questions/:id`: Lấy một câu hỏi cụ thể bằng ID.
-   `POST /api/questions`: Tạo một câu hỏi mới.
-   `PUT /api/questions/:id`: Cập nhật một câu hỏi cụ thể bằng ID.
-   `DELETE /api/questions/:id`: Xóa một câu hỏi cụ thể bằng ID.
-   `POST /api/quiz`: Tạo một trò chơi mới với một tập câu hỏi.
-   `GET /api/quiz/:id`: Lấy một trò chơi cụ thể bằng ID.
-   `POST /api/quiz/:id/submit`: Gửi câu trả lời của người dùng cho một trò chơi.
-   ...Và còn nhiều endpoint khác.

## Đóng góp

Nếu bạn muốn đóng góp cho dự án EzQuiz Server, bạn có thể làm theo các bước sau:

1. Fork dự án này (bằng cách nhấp vào nút "Fork" ở góc phải trên cùng của trang)
2. Clone repository đã fork về máy tính của bạn
3. Tạo một nhánh mới từ nhánh `main`
4. Thực hiện các thay đổi, sửa lỗi hoặc thêm tính năng mới
5. Commit và push các thay đổi lên repository của bạn
6. Tạo một Pull Request (PR) từ nhánh của bạn vào nhánh `main` của dự án chính

Chúng tôi sẽ xem xét và xem xét đóng góp của bạn. Cảm ơn bạn!

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc đề xuất nào, hãy liên hệ với chúng tôi qua email: levanduy08062003@gmail.com hoặc FaceBook: https://www.facebook.com/profile.php?id=100024539650227 và https://www.facebook.com/imyady86/.

---

Đây là tài liệu hướng dẫn cho API của EzQuiz Server. Nếu bạn có bất kỳ câu hỏi hoặc gặp khó khăn nào trong quá trình cài đặt hoặc sử dụng API, hãy liên hệ với chúng tôi. Hãy thử sử dụng EzQuiz Server và tận hưởng!
