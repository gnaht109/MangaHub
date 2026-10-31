package com.mangahub.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data  
@NoArgsConstructor 
@AllArgsConstructor 
public class UpdateCartItemRequest {
    @Min(0)
    @Max(value = 10, message = "You can have at most 10 of one volume in your cart.")
    int quantity;
}
