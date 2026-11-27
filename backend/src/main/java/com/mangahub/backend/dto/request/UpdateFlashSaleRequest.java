package com.mangahub.backend.dto.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
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
public class UpdateFlashSaleRequest {
    String name;

    LocalDate startDate;

    LocalDate endDate;
}
