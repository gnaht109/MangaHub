package com.mangahub.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.mangahub.backend.dto.request.AddFlashSaleItemRequest;
import com.mangahub.backend.dto.request.FlashSaleCreateRequest;
import com.mangahub.backend.dto.request.UpdateFlashSaleItemRequest;
import com.mangahub.backend.dto.request.UpdateFlashSaleRequest;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.FlashSaleResponse;
import com.mangahub.backend.service.FlashSaleService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;




@RestController 
@RequestMapping("/api/flash-sale")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlashSaleController {
    FlashSaleService flashSaleService;

    @GetMapping
    public ApiResponse<List<FlashSaleResponse>> getAllFlashSales() {
        List<FlashSaleResponse> flashSales = flashSaleService.getAll();
        return ApiResponse.<List<FlashSaleResponse>>builder()
                        .data(flashSales)
                        .build();
    }

    @GetMapping("/active")
    public ApiResponse<List<FlashSaleResponse>> getActiveFlashSales() {
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
    public ApiResponse<FlashSaleResponse> createFlashSale(@Valid @RequestBody FlashSaleCreateRequest request) {
        FlashSaleResponse flashSale = flashSaleService.createFlashSale(request);
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(flashSale)
                        .build();
    }

    @PostMapping("/{flashSaleId}/items")
    public ApiResponse<FlashSaleResponse> addFlashSaleItem(@PathVariable("flashSaleId") Long flashSaleId,
                                                           @NotEmpty(message = "At least one flash sale item is required")
                                                           @RequestBody List<@Valid AddFlashSaleItemRequest> requests
    ) {
        FlashSaleResponse flashSale = flashSaleService.addFlashSaleItem(flashSaleId, requests);
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(flashSale)
                        .build();
    }
    
    @PutMapping("/{flashSaleId}")
    public ApiResponse<FlashSaleResponse> editFlashSale(@PathVariable("flashSaleId") Long flashSaleId, 
                                                        @RequestBody @Valid UpdateFlashSaleRequest request) {        
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(flashSaleService.editFlashSale(flashSaleId, request))
                        .build();
    }    

    @PutMapping("/{flashSaleId}/items/{id}")
    public ApiResponse<FlashSaleResponse> editFlashSaleItem(@PathVariable("flashSaleId") Long flashSaleId, 
                                                            @PathVariable("id") Long itemId,
                                                            @RequestBody @Valid UpdateFlashSaleItemRequest request) {        
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(flashSaleService.editFlashSaleItem(flashSaleId, itemId, request))
                        .build();
    }

    @DeleteMapping("/{flashSaleId}/items/{id}")
    public ApiResponse<FlashSaleResponse> removeFlashSaleItem(@PathVariable("flashSaleId") Long flashSaleId,
                                                              @PathVariable("id") Long itemId) {
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(flashSaleService.removeFlashSaleItem(flashSaleId, itemId))
                        .build();          
    }   

    @PostMapping("/{id}/cancel")
    public ApiResponse<FlashSaleResponse> cancelFlashSale(@PathVariable("id") Long id) {
        FlashSaleResponse cancelledFlashSale = flashSaleService.cancelFlashSale(id);
        return ApiResponse.<FlashSaleResponse>builder()
                        .data(cancelledFlashSale)
                        .build();
    }
}
