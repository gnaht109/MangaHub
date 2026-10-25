package com.mangahub.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;


@Getter
public enum ErrorCode {
    UNCAUGHT_ERROR(500, "An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR),
    FORBIDDEN(403, "Forbidden Access.", HttpStatus.FORBIDDEN),  //Server knows who u r but u dont have permission
    UNAUTHORIZED(401, "Unauthorized.", HttpStatus.UNAUTHORIZED), //Server dont know who u r
    INVALID_INPUT(400, "Invalid input.", HttpStatus.BAD_REQUEST),
    BAD_CREDENTIALS(401, "Your email or your password is incorrect.", HttpStatus.UNAUTHORIZED),
    EMAIL_ALREADY_EXISTS(409, "This email already exists.", HttpStatus.CONFLICT),
    USER_NOT_FOUND(404, "User is not found with this email.", HttpStatus.NOT_FOUND),
    
    // MANGA
    MANGA_NOT_FOUND(404, "Manga not found", HttpStatus.NOT_FOUND),
    MANGA_ALREADY_EXISTS(409, "This manga already exists.", HttpStatus.CONFLICT),
    
    // FLASHSALE
    INVALID_FLASH_SALE_DATES(400, "The end date cannot be set before the starting date or today's date.", HttpStatus.BAD_REQUEST),
    FLASH_SALE_ALREADY_ENDED(409, "The flash sale has ended.", HttpStatus.CONFLICT),
    FLASH_SALE_ALREADY_EXISTS(409, "This flash sale already exists.", HttpStatus.CONFLICT),
    FLASH_SALE_NOT_FOUND(404, "This flash sale is not found.", HttpStatus.NOT_FOUND),

    // FLASHSALEITEM
    DUPLICATE_FLASH_SALE_ITEM(409, "This item has already been added.", HttpStatus.CONFLICT),
    INVALID_DISCOUNTED_PRICE(400, "The discounted price must be lower than the base price.", HttpStatus.BAD_REQUEST),

    // GENRE
    GENRE_ALREADY_EXISTS(409, "This genre already exists.", HttpStatus.CONFLICT),
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
