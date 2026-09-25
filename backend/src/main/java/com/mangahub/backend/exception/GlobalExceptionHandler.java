package com.mangahub.backend.exception;

import java.nio.file.AccessDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import com.mangahub.backend.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;


@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler{

    @ExceptionHandler(value = Exception.class) 
    ResponseEntity<ApiResponse<Void>> handlingRuntimeException(Exception ex) {
        log.error("Unhandled exception", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.UNCAUGHT_ERROR.getCode())
                        .message(ErrorCode.UNCAUGHT_ERROR.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AppException.class) 
    ResponseEntity<ApiResponse<Void>> handlingAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handlingAccessDeniedException(AccessDeniedException ex) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.<Void>builder()
                    .code(errorCode.getCode())
                    .message(errorCode.getMessage())
                    .build()
        );
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class) 
    ResponseEntity<ApiResponse<Void>> handlingValidation(MethodArgumentNotValidException ex) {
        String message = ex.getFieldError() != null
                ? ex.getFieldError().getDefaultMessage()
                : ErrorCode.INVALID_INPUT.getMessage();

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.<Void>builder()
                        .code(ErrorCode.INVALID_INPUT.getCode())
                        .message(message)
                        .build());
    }
}
