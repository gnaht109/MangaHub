package com.mangahub.backend.dto.response;

import java.time.LocalDate;
import java.util.List;
import com.mangahub.backend.enums.FlashSaleStatus;
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
public class FlashSaleResponse {
    Long id;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    FlashSaleStatus status;
    Long userId;
    List<FlashSaleItemResponse> items;
}
