package com.mangahub.backend.dto.response;

import java.math.BigDecimal;
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
public class FlashSaleItemResponse {
    Long id;
    Long mangaId;
    Long flashSaleId;
    BigDecimal discountedPrice;
    Integer saleQuantityLimit;
    Integer quantitySold;
}
