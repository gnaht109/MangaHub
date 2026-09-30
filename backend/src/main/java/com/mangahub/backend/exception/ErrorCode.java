package com.mangahub.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;


@Getter
public enum ErrorCode {
    UNCAUGHT_ERROR(500, "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    FORBIDDEN(403, "Forbidden Access", HttpStatus.FORBIDDEN),  //Server knows who u r but u dont have permission
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED), //Server dont know who u r
    INVALID_INPUT(400, "Invalid input", HttpStatus.BAD_REQUEST),
    BAD_CREDENTIALS(401, "Your email or your password is incorrect", HttpStatus.UNAUTHORIZED),
    EMAIL_ALREADY_EXISTS(409, "This email already exists.", HttpStatus.CONFLICT),
    //MANGA
    MANGA_NOT_FOUND(404, "Manga not found", HttpStatus.NOT_FOUND),

    ;
    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;
}
