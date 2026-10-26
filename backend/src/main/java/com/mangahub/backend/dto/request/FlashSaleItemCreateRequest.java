package com.mangahub.backend.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class FlashSaleItemCreateRequest {
    
    @NotBlank(message = "Manga id is required")
    Long mangaId;

    @NotNull(message = "Discounted price is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Discounted price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Discounted price must have at most 2 decimal places")
    BigDecimal discountedPrice;
    
    @NotNull(message = "Sale quantity limit is required")
    @Min(value = 1, message = "Sale quantity limit must be at least 1")
    Integer saleQuantityLimit;
}
