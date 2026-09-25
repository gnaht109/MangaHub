package com.mangahub.backend.exception;

public class AppException extends RuntimeException {
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
    
    private ErrorCode errorCode;

    public ErrorCode getErrorCode() {
        return this.errorCode;
    }

    public void setErrorCode() {
        this.errorCode = errorCode;
    }
}
