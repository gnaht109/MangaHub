package com.mangahub.backend.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateFlashSaleItemRequest {

    @DecimalMin(value = "0.00", inclusive = false, message = "Discounted price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Discounted price must have at most 2 decimal places")
    BigDecimal discountedPrice;

    @Min(value = 0, message = "Stock quantity must be greater or equal to 0")
    Integer stockQuantity;
}
