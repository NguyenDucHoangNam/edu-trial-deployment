package com.fpt.edu_trial.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException; // For Spring Boot 3.x+

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice // Áp dụng cho tất cả các @RestController
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // Xử lý custom AppException
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(errorCode.getHttpStatus().value())
                .error(errorCode.getHttpStatus().getReasonPhrase())
                .errorCode(errorCode.name()) // Lấy tên của enum constant
                .message(ex.getDetailedMessage() != null ? ex.getDetailedMessage() : errorCode.getMessage())
                .path(request.getRequestURI())
                .build();
        log.error("AppException: Code - {}, Message - {}, Path - {}", errorCode.name(), errorResponse.getMessage(), request.getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, errorCode.getHttpStatus());
    }

    // Xử lý lỗi validation cho @RequestBody (@Valid)
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                validationErrors.put(error.getField(), error.getDefaultMessage())
        );

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .errorCode(ErrorCode.VALIDATION_FAILED.name()) // Hoặc một mã lỗi cụ thể hơn
                .message("Lỗi xác thực dữ liệu đầu vào.")
                .path(((ServletWebRequest) request).getRequest().getRequestURI())
                .validationErrors(validationErrors)
                .build();
        log.warn("MethodArgumentNotValidException: Errors - {}, Path - {}", validationErrors, ((ServletWebRequest) request).getRequest().getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Xử lý lỗi validation cho @RequestParam, @PathVariable,...
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> validationErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            // Lấy tên thuộc tính từ path (ví dụ: "methodName.argumentName")
            String propertyPath = violation.getPropertyPath().toString();
            String fieldName = propertyPath.substring(propertyPath.lastIndexOf('.') + 1);
            validationErrors.put(fieldName, violation.getMessage());
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .errorCode(ErrorCode.VALIDATION_FAILED.name())
                .message("Lỗi xác thực tham số.")
                .path(request.getRequestURI())
                .validationErrors(validationErrors)
                .build();
        log.warn("ConstraintViolationException: Errors - {}, Path - {}", validationErrors, request.getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Xử lý lỗi Access Denied của Spring Security
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        ErrorCode errorCode = ErrorCode.ACCESS_DENIED;
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(errorCode.getHttpStatus().value())
                .error(errorCode.getHttpStatus().getReasonPhrase())
                .errorCode(errorCode.name())
                .message(errorCode.getMessage()) // Hoặc ex.getMessage() nếu muốn thông điệp từ Spring Security
                .path(request.getRequestURI())
                .build();
        log.warn("AccessDeniedException: Message - {}, Path - {}", errorResponse.getMessage(), request.getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, errorCode.getHttpStatus());
    }

    // Xử lý lỗi sai kiểu dữ liệu tham số
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = String.format("Tham số '%s' phải có kiểu '%s'. Giá trị nhận được: '%s'",
                ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown", ex.getValue());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .errorCode(ErrorCode.INVALID_PARAMETER_FORMAT.name())
                .message(message)
                .path(request.getRequestURI())
                .build();
        log.warn("MethodArgumentTypeMismatchException: Message - {}, Path - {}", message, request.getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Override các method từ ResponseEntityExceptionHandler để tùy chỉnh response (nếu cần)
    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = String.format("Phương thức '%s' không được hỗ trợ cho đường dẫn này. Các phương thức được hỗ trợ: %s",
                ex.getMethod(), ex.getSupportedHttpMethods());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(HttpStatus.valueOf(status.value()).getReasonPhrase())
                .errorCode("METHOD_NOT_SUPPORTED") // Bạn có thể thêm vào ErrorCode enum
                .message(message)
                .path(((ServletWebRequest)request).getRequest().getRequestURI())
                .build();
        log.warn("HttpRequestMethodNotSupportedException: Message - {}, Path - {}", message, ((ServletWebRequest)request).getRequest().getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, headers, status);
    }

    // For Spring Boot 3.x+ for handling requests to non-existent endpoints
    @Override
    protected ResponseEntity<Object> handleNoResourceFoundException(
            NoResourceFoundException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ErrorCode errorCode = ErrorCode.RESOURCE_NOT_FOUND; // Hoặc một mã lỗi cụ thể hơn như ENDPOINT_NOT_FOUND
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(HttpStatus.valueOf(status.value()).getReasonPhrase())
                .errorCode(errorCode.name())
                .message("Không tìm thấy điểm cuối (endpoint) cho yêu cầu: " + ex.getResourcePath())
                .path(ex.getResourcePath()) // Hoặc ((ServletWebRequest)request).getRequest().getRequestURI()
                .build();
        log.warn("NoResourceFoundException: Message - {}, Path - {}", errorResponse.getMessage(), errorResponse.getPath(), ex);
        return new ResponseEntity<>(errorResponse, headers, status);
    }


    // Xử lý tất cả các exception khác không được bắt cụ thể (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(errorCode.getHttpStatus().value())
                .error(errorCode.getHttpStatus().getReasonPhrase())
                .errorCode(errorCode.name())
                .message("Đã có lỗi không mong muốn xảy ra: " + ex.getMessage()) // Trong production có thể ẩn ex.getMessage()
                .path(request.getRequestURI())
                .build();
        log.error("Unhandled GlobalException: Message - {}, Path - {}", ex.getMessage(), request.getRequestURI(), ex);
        return new ResponseEntity<>(errorResponse, errorCode.getHttpStatus());
    }
}