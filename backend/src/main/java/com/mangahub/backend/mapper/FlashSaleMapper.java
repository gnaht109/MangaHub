package com.mangahub.backend.mapper;

import java.time.LocalDate;
import java.util.List;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.mangahub.backend.dto.request.FlashSaleCreateRequest;
import com.mangahub.backend.dto.request.FlashSaleItemCreateRequest;
import com.mangahub.backend.dto.response.FlashSaleItemResponse;
import com.mangahub.backend.dto.response.FlashSaleResponse;
import com.mangahub.backend.enums.FlashSaleStatus;
import com.mangahub.backend.model.FlashSale;
import com.mangahub.backend.model.FlashSaleItem;

@Mapper(componentModel = "spring")
public interface FlashSaleMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "items", ignore = true)
    FlashSale toEntityFlashSale(FlashSaleCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "flashSale", ignore = true)
    @Mapping(target = "quantitySold", ignore = true)
    @Mapping(target = "manga", ignore = true)
    FlashSaleItem toEntityFlashSaleItem(FlashSaleItemCreateRequest request);

    @Mapping(target = "userId", source = "user.id")
    FlashSaleResponse toFlashSaleResponse(FlashSale flashSale);

    List<FlashSaleResponse> toFlashSaleResponses(List<FlashSale> flashSales);

    @Mapping(target = "mangaId", source = "manga.id")
    @Mapping(target = "flashSaleId", source = "flashSale.id")
    FlashSaleItemResponse toFlashSaleItemResponse(FlashSaleItem flashSaleItem);

    List<FlashSaleItemResponse> tFlashSaleItemResponses(List<FlashSaleItem> flashSaleItems);

    @AfterMapping 
    default void resolveStatus(FlashSale source, @MappingTarget FlashSaleResponse target) {
        LocalDate today = LocalDate.now();

        if(today.isBefore(source.getStartDate())) {
            target.setStatus(FlashSaleStatus.UPCOMING);
        } else if (today.isAfter(source.getEndDate())) {
            target.setStatus(FlashSaleStatus.ENDED);
        } else {
            target.setStatus(FlashSaleStatus.ACTIVE);
        }
    }
}
