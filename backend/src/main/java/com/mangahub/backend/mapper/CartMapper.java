package com.mangahub.backend.mapper;

import java.math.BigDecimal;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.mangahub.backend.dto.response.CartItemResponse;
import com.mangahub.backend.dto.response.CartResponse;
import com.mangahub.backend.model.Cart;
import com.mangahub.backend.model.CartItem;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(target = "subTotal", ignore = true)
    CartResponse toCartResponse(Cart cart);

    @AfterMapping  
    default void fillTotals(@MappingTarget CartResponse cartResponse){
        BigDecimal subTotal = BigDecimal.ZERO;
        if(cartResponse.getItems()!=null){
            for (CartItemResponse item : cartResponse.getItems()) {
                subTotal = subTotal.add(item.getLineTotal());
            }
        }
        cartResponse.setSubTotal(subTotal);
    }

    @Mapping(target = "mangaId", source = "manga.id")
    @Mapping(target = "flashSaleItemId", source = "flashSaleItem.id")
    @Mapping(target = "title", source = "manga.title")
    @Mapping(target = "unitPrice", ignore = true)
    @Mapping(target = "lineTotal", ignore = true)
    CartItemResponse toCartItemResponse(CartItem cartItem);

    @AfterMapping
    default void fillLineTotal(@MappingTarget CartItemResponse cartItemResponse, CartItem cartItem){
        BigDecimal unitPrice = cartItem.getFlashSaleItem() == null
            ? cartItem.getManga().getBasePrice()
            : cartItem.getFlashSaleItem().getDiscountedPrice();
        cartItemResponse.setUnitPrice(unitPrice);
        cartItemResponse.setLineTotal(
            unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()))
        );
    }


}
