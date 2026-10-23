package com.mangahub.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import com.mangahub.backend.service.CartService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.mangahub.backend.security.UserDetailsImpl;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.CartResponse;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    // @GetMapping
    // ApiResponse<CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
    //     CartResponse cartResponse = cartService.getCart(userDetails.getId());
    //     return ApiResponse.<CartResponse>builder()
    //             .data(cartResponse)
    //             .build();
    // }
}
