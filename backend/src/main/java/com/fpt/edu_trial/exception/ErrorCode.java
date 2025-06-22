package com.fpt.edu_trial.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ===== Lỗi chung (0xxx) =====
    UNCATEGORIZED_EXCEPTION(0001, "Lỗi không xác định.", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_PARAMETER_FORMAT(0002, "Định dạng tham số không hợp lệ.", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_BODY_FORMAT(0003, "Định dạng request body không hợp lệ.", HttpStatus.BAD_REQUEST),
    MISSING_REQUEST_PART(0004, "Thiếu phần cần thiết trong request.", HttpStatus.BAD_REQUEST),
    BAD_REQUEST(0005, "Yêu cầu không hợp lệ.", HttpStatus.BAD_REQUEST), // THÊM MÃ LỖI NÀY

    // ===== Lỗi Xác thực & Phân quyền (1xxx) =====
    UNAUTHENTICATED(1000, "Yêu cầu xác thực. Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(1001, "Không có quyền truy cập tài nguyên này.", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1002, "Email hoặc mật khẩu không chính xác.", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(1003, "Token không hợp lệ hoặc đã bị thay đổi.", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1004, "Token đã hết hạn. Vui lòng đăng nhập lại.", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_INVALID(1005, "Refresh token không hợp lệ.", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(1006, "Refresh token đã hết hạn. Vui lòng đăng nhập lại.", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED(1007, "Tài khoản đã bị khóa.", HttpStatus.FORBIDDEN),
    ACCOUNT_DISABLED(1008, "Tài khoản đã bị vô hiệu hóa.", HttpStatus.FORBIDDEN),
    EMAIL_NOT_VERIFIED(1009, "Email chưa được xác thực.", HttpStatus.FORBIDDEN),
    ROLE_NOT_EXISTED(1010, "Vai trò được yêu cầu không tồn tại.", HttpStatus.BAD_REQUEST), // ĐÂY LÀ ĐỊNH NGHĨA

    // ===== Lỗi liên quan đến Người dùng (User) (2xxx) =====
    USER_NOT_VERIFIED(2001, "Tài khoản đã được đăng ký nhưng chưa xác thực.", HttpStatus.BAD_REQUEST),
    USER_EXISTED(2000, "Người dùng với email này đã tồn tại.", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2001, "Không tìm thấy người dùng.", HttpStatus.NOT_FOUND),
    CANNOT_CREATE_USER(2002, "Không thể tạo người dùng.", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_UPDATE_USER(2003, "Không thể cập nhật thông tin người dùng.", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_OLD_PASSWORD(2004, "Mật khẩu cũ không chính xác.", HttpStatus.BAD_REQUEST),
    OTP_INVALID(2005, "Mã OTP không hợp lệ.", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(2006, "Mã OTP đã hết hạn.", HttpStatus.BAD_REQUEST),
    OTP_SEND_LIMIT_EXCEEDED(2007, "Vượt quá số lần gửi OTP cho phép.", HttpStatus.TOO_MANY_REQUESTS),
    ACCOUNT_ALREADY_VERIFIED(2008, "Tài khoản này đã được xác thực trước đó.", HttpStatus.BAD_REQUEST), // THÊM MÃ LỖI NÀY
    NEW_PASSWORD_MISMATCH(2009, "Mật khẩu mới và mật khẩu xác nhận không khớp.", HttpStatus.BAD_REQUEST), // THÊM MÃ LỖI NÀY
    USER_ALREADY_LINKED_TO_UNIVERSITY(2010, "Tài khoản của bạn đã được liên kết với một trường đại học khác.", HttpStatus.BAD_REQUEST), // THÊM MÃ LỖI NÀY

    // ===== Lỗi liên quan đến Tài nguyên chung (Resource) (3xxx) =====
    RESOURCE_NOT_FOUND(3000, "Không tìm thấy tài nguyên được yêu cầu.", HttpStatus.NOT_FOUND),
    CANNOT_CREATE_RESOURCE(3001, "Không thể tạo tài nguyên.", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_UPDATE_RESOURCE(3002, "Không thể cập nhật tài nguyên.", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_DELETE_RESOURCE(3003, "Không thể xóa tài nguyên.", HttpStatus.INTERNAL_SERVER_ERROR),
    DUPLICATE_RESOURCE(3004, "Tài nguyên đã tồn tại.", HttpStatus.CONFLICT), // Ví dụ: tên danh mục đã tồn tại
    CLOUDINARY_UPLOAD_FAILED(3005, "Upload image to Cloudinary failed.", HttpStatus.INTERNAL_SERVER_ERROR), // Ví dụ: tên danh mục đã tồn tại

    // ===== Lỗi liên quan đến Khóa học (Course) (4xxx) =====
    COURSE_NOT_FOUND(4000, "Không tìm thấy khóa học.", HttpStatus.NOT_FOUND),
    COURSE_ALREADY_REGISTERED_BY_USER(4001, "Bạn đã đăng ký khóa học này rồi.", HttpStatus.BAD_REQUEST),
    COURSE_CAPACITY_FULL(4002, "Khóa học đã đủ số lượng học viên.", HttpStatus.BAD_REQUEST),
    COURSE_REGISTRATION_NOT_OPEN(4003, "Thời gian đăng ký khóa học chưa mở hoặc đã kết thúc.", HttpStatus.BAD_REQUEST),

    // ===== Lỗi liên quan đến Trường Đại học (University) (5xxx) =====
    UNIVERSITY_NOT_FOUND(5000, "Không tìm thấy trường đại học.", HttpStatus.NOT_FOUND),
    UNIVERSITY_ALREADY_VERIFIED(5001, "Trường đại học này đã được xác minh.", HttpStatus.BAD_REQUEST),
    UNIVERSITY_REGISTRATION_PENDING(5002, "Đơn đăng ký của trường đang chờ duyệt.", HttpStatus.BAD_REQUEST),
    UNIVERSITY_NAME_ALREADY_EXISTS(5003, "Tên trường đại học đã tồn tại.", HttpStatus.BAD_REQUEST),
    UNIVERSITY_SHORTNAME_ALREADY_EXISTS(5004, "Mã trường đại học đã tồn tại.", HttpStatus.BAD_REQUEST),

    // ===== Lỗi liên quan đến Quiz, Bài tập (6xxx) =====
    QUIZ_NOT_FOUND(6000, "Không tìm thấy bài quiz.", HttpStatus.NOT_FOUND),
    QUIZ_SUBMISSION_CLOSED(6001, "Thời gian làm bài quiz đã kết thúc.", HttpStatus.BAD_REQUEST),
    QUIZ_ALREADY_SUBMITTED(6002, "Bạn đã nộp bài quiz này rồi.", HttpStatus.BAD_REQUEST),

    // ===== Lỗi liên quan đến Validation (7xxx) =====
    VALIDATION_FAILED(7000, "Một hoặc nhiều trường dữ liệu không hợp lệ.", HttpStatus.BAD_REQUEST),

    // ===== Lỗi liên quan đến File (8xxx) =====
    FILE_UPLOAD_FAILED(8000, "Tải file lên thất bại.", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(8001, "Không tìm thấy file.", HttpStatus.NOT_FOUND),
    FILE_TOO_LARGE(8002, "Dung lượng file vượt quá giới hạn cho phép.", HttpStatus.PAYLOAD_TOO_LARGE),
    INVALID_FILE_TYPE(8003, "Định dạng file không được hỗ trợ.", HttpStatus.UNSUPPORTED_MEDIA_TYPE),

    // ===== Lỗi Hệ thống / Máy chủ (9xxx) =====
    INTERNAL_SERVER_ERROR(9000, "Đã có lỗi xảy ra ở phía máy chủ. Vui lòng thử lại sau.", HttpStatus.INTERNAL_SERVER_ERROR),
    DATABASE_ERROR(9001, "Lỗi truy vấn cơ sở dữ liệu.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXTERNAL_SERVICE_ERROR(9002, "Lỗi khi giao tiếp với dịch vụ bên ngoài.", HttpStatus.SERVICE_UNAVAILABLE)
    ;

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

}
