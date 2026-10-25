package com.mangahub.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.mangahub.backend.dto.request.FlashSaleCreateRequest;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.FlashSaleResponse;
import com.mangahub.backend.service.FlashSaleService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping("/api/flash-sales")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlashSaleController {
    FlashSaleService flashSaleService;

    @GetMapping
    ApiResponse<List<FlashSaleResponse>> getAllFlashSales() {
        List<FlashSaleResponse> flashSales = flashSaleService.getAll();
        return ApiResponse.<List<FlashSaleResponse>>builder()
                        .data(flashSales)
                        .build();
    }

    @GetMapping("/active")
    ApiResponse<List<FlashSaleResponse>> getActiveFlashSales() {
        List<FlashSaleResponse> activeFlashSales = flashSaleService.getActive();
        return ApiResponse.<List<FlashSaleResponse>>builder()
                        .data(activeFlashSales)
                        .build();
    }

    // @GetMapping("/{id}")
    // ApiResponse<FlashSaleResponse> getFlashSaleById(@PathVariable("id") Long id) {
    //     FlashSaleResponse flashSale = flashSaleService.getById(id);
    //     return ApiResponse.<FlashSaleResponse>builder()
    //                     .data(flashSale)
    //                     .build();
    // }

    @PostMapping
    ApiResponse<FlashSaleResponse> createFlashSale(@Valid @RequestBody FlashSaleCreateRequest request) {
        FlashSaleResponse flashSale = flashSaleService.createFlashSale(request);
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(flashSale)
                        .build();
    }

    @PostMapping("/{id}/cancel")
    ApiResponse<FlashSaleResponse> cancelFlashSale(@PathVariable("id") Long id) {
        FlashSaleResponse cancelledFlashSale = flashSaleService.cancelFlashSale(id);
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(cancelledFlashSale)
                        .build();
    }
}
