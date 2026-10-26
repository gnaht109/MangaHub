package com.mangahub.backend.dto.request;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class FlashSaleCreateRequest {
    

    @NotBlank(message = "Flash Sale must have a name")
    @Size(max = 50, message = "Flash Sale cannot have more than 50 characters")
    String name;

    @NotNull 
    LocalDate startDate;

    @NotNull 
    LocalDate endDate;
    
    // @NotEmpty <-- leave empty for testing purposes
    List<@Valid FlashSaleItemCreateRequest> items;
}
