package com.mangahub.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor 
@AllArgsConstructor 
public class AddCartItemRequest {
    @NotNull
    Long productId;

    @Min(1)
    @Max(10)
    int quantity;
}
