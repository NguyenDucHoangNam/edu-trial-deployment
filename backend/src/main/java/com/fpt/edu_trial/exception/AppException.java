package com.fpt.edu_trial.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String detailedMessage; // Cho phép thêm thông tin chi tiết nếu cần

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage()); // Sử dụng message từ ErrorCode làm message của Exception
        this.errorCode = errorCode;
        this.detailedMessage = errorCode.getMessage();
    }

    public AppException(ErrorCode errorCode, String detailedMessage) {
        super(detailedMessage);
        this.errorCode = errorCode;
        this.detailedMessage = detailedMessage;
    }

    public AppException(ErrorCode errorCode, String detailedMessage, Throwable cause) {
        super(detailedMessage, cause);
        this.errorCode = errorCode;
        this.detailedMessage = detailedMessage;
    }


}