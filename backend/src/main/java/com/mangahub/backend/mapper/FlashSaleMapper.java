package com.mangahub.backend.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
    @Mapping(target = "items", ignore = true)
    FlashSaleResponse toFlashSaleResponse(FlashSale flashSale);

    // return Flash Sale with live availableStock on its items
    default FlashSaleResponse toFlashSaleResponse(FlashSale flashSale, Map<Long, Integer> reservedMap) {
        FlashSaleResponse response = toFlashSaleResponse(flashSale);
        if(flashSale.getItems() != null) {
            response.setItems(toFlashSaleItemResponses(flashSale.getItems(), reservedMap));
        }
        return response;
    }

    // return Flash Sales with live availableStock on its items
    default List<FlashSaleResponse> toFlashSaleResponses(List<FlashSale> flashSales, Map<Long, Integer> reservedMap) {
        return flashSales.stream()
                    .map(flashSale -> toFlashSaleResponse(flashSale, reservedMap))
                    .toList();
    }

    @Mapping(target = "mangaId", source = "flashSaleItem.manga.id")
    @Mapping(target = "flashSaleId", source = "flashSaleItem.flashSale.id")
    @Mapping(target = "availableStock", expression = "java(Math.max(0, flashSaleItem.getSaleQuantityLimit() - flashSaleItem.getQuantitySold() - reservedStock))")    
    FlashSaleItemResponse toFlashSaleItemResponse(FlashSaleItem flashSaleItem, int reservedStock);

    default List<FlashSaleItemResponse> toFlashSaleItemResponses(List<FlashSaleItem> flashSaleItems, Map<Long, Integer> reservedMap) {
        return flashSaleItems.stream()
                    .map(item -> toFlashSaleItemResponse(item, reservedMap.getOrDefault(item.getId(), 0)))
                    .toList();
    }

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
