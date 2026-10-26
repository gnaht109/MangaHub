package com.mangahub.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mangahub.backend.dto.request.GenreCreateRequest;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.GenreResponse;
import com.mangahub.backend.service.GenreService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping("/api/genres")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenreController {
    GenreService genreService;

    @GetMapping
    public ApiResponse<List<GenreResponse>> getAllGenres() {
        return ApiResponse.<List<GenreResponse>>builder()
                .data(genreService.getAll())
                .build();
    }

    @PostMapping
    public ApiResponse<GenreResponse> createGenre(@Valid @RequestBody GenreCreateRequest request) {
        return ApiResponse.<GenreResponse>builder()
                .data(genreService.createGenre(request))
                .build();
    }
    
    
}
