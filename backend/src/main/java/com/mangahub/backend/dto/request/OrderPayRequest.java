package com.mangahub.backend.dto.request;

import com.mangahub.backend.enums.PaymentMethod;

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
public class OrderPayRequest {
    
    @NotNull(message = "Shipping address is required")
    String shippingAddress;

    @NotNull(message = "Please choose a payment method")
    PaymentMethod paymentMethod;
}
