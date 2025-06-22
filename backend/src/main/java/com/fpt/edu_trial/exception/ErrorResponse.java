package com.fpt.edu_trial.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Chỉ bao gồm các trường không null trong JSON response
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status; // HTTP status code (ví dụ: 400, 404, 500)
    private String error; // HTTP status phrase (ví dụ: "Bad Request", "Not Found")
    private String errorCode; // Mã lỗi nội bộ từ ErrorCode enum (ví dụ: "USER_NOT_FOUND")
    private String message; // Thông điệp lỗi chi tiết
    private String path; // Đường dẫn API gây ra lỗi

    // Dùng cho lỗi validation, chứa danh sách các lỗi của từng trường
    private Map<String, String> validationErrors;
    private List<String> errors; // Hoặc một danh sách các thông điệp lỗi chung
}