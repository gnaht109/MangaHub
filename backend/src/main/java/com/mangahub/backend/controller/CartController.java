package com.mangahub.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import com.mangahub.backend.service.CartService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.mangahub.backend.security.UserDetailsImpl;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.CartResponse;

import com.mangahub.backend.dto.request.AddCartItemRequest;
import com.mangahub.backend.dto.request.UpdateCartItemRequest;
import lombok.AccessLevel;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl user) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.getCart(user.getId()))
                .build();
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CartResponse> addItem(@AuthenticationPrincipal UserDetailsImpl user,
                                             @Valid @RequestBody AddCartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.addItem(user.getId(), request))
                .build();
    }

    @PutMapping("/items/{mangaId}")
    public ApiResponse<CartResponse> updateQuantity(@AuthenticationPrincipal UserDetailsImpl user,
                                                    @PathVariable Long mangaId,
                                                    @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.updateQuantity(user.getId(), mangaId, request.getQuantity()))
                .build();
    }

    @DeleteMapping("/items/{mangaId}")
    public ApiResponse<CartResponse> removeItem(@AuthenticationPrincipal UserDetailsImpl user,
                                                @PathVariable Long mangaId) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.removeItem(user.getId(), mangaId))
                .build();
    }
}
