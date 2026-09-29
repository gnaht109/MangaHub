package com.mangahub.backend.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
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
public class MangaCreateRequest {
    
    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Author is required")
    String author;

    String description;

    @NotNull(message = "Base price is required")
    BigDecimal basePrice;
}
