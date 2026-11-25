package com.mangahub.backend.controller;


import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mangahub.backend.dto.request.OrderCreateRequest;
import com.mangahub.backend.dto.request.OrderPayRequest;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.OrderResponse;
import com.mangahub.backend.security.UserDetailsImpl;
import com.mangahub.backend.service.OrderService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/order")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    
    OrderService orderService;

    @PostMapping("/checkout")    
    public ApiResponse<OrderResponse> checkout(@AuthenticationPrincipal UserDetailsImpl user,
                                               @Valid OrderCreateRequest request) {
            return ApiResponse.<OrderResponse>builder()
                            .message("Order placed successfully")
                            .data(orderService.checkout(user.getId(), request))
                            .build();
    }

    @PatchMapping("/{orderId}/pay")
    public ApiResponse<OrderResponse> confirmPayment(@AuthenticationPrincipal UserDetailsImpl user,
                                                     @PathVariable Long orderId,
                                                     @Valid @RequestBody OrderPayRequest request) { 
            return ApiResponse.<OrderResponse>builder()
                            .message("Payment confirmed successfully")
                            .data(orderService.confirmPayment(user.getId(), orderId, request))
                            .build();               
    }

    @GetMapping()
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl user) {
        return ApiResponse.<List<OrderResponse>>builder()
                    .data(orderService.getMyOrders(user.getId()))
                    .build();
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@AuthenticationPrincipal UserDetailsImpl user, @PathVariable Long orderId) {
        return ApiResponse.<OrderResponse>builder()
                    .data(orderService.getOrderById(user.getId(), orderId))
                    .build();
    }
    
    @PostMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@AuthenticationPrincipal UserDetailsImpl user, @PathVariable Long orderId) {
        return ApiResponse.<OrderResponse>builder()
                    .data(orderService.cancelOrder(user.getId(), orderId))
                    .build();        
    }
}
