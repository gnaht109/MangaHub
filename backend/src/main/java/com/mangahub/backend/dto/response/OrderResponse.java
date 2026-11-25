package com.mangahub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.mangahub.backend.enums.OrderStatus;
import com.mangahub.backend.enums.PaymentMethod;

import lombok.AccessLevel;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long id;
    Long customerId;
    OrderStatus status;
    BigDecimal totalAmount;
    String shippingAddress;
    PaymentMethod paymentMethod;
    LocalDate orderDate;
    List<OrderItemResponse> items;    
}
