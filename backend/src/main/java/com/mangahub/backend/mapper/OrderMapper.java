package com.mangahub.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.mangahub.backend.dto.response.OrderItemResponse;
import com.mangahub.backend.dto.response.OrderResponse;
import com.mangahub.backend.model.Order;
import com.mangahub.backend.model.OrderItem;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    
    @Mapping(target = "customerId", source = "customer.id")
    OrderResponse toOrderResponse(Order order);

    List<OrderResponse> toOrderResponses(List<Order> orders);

    @Mapping(target = "mangaId", source = "manga.id")
    @Mapping(target = "mangaTitle", source = "manga.title")
    @Mapping(target = "flashSaleItemId", source = "flashSaleItem.id")
    OrderItemResponse tOrderItemResponse(OrderItem orderItem);
}
