package com.mangahub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

import lombok.AccessLevel;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemResponse {
    Long id;
    Long mangaId;
    String mangaTitle;
    Long flashSaleItemId;
    Integer quantity;
    BigDecimal originalPrice;
    BigDecimal unitPrice;
    BigDecimal subtotal;    
}
