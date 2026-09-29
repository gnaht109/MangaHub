package com.mangahub.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mangahub.backend.dto.request.MangaCreateRequest;
import com.mangahub.backend.dto.response.ApiResponse;
import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.service.MangaService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/manga")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MangaController {
    MangaService mangaService;

    @GetMapping
    ApiResponse<List<MangaResponse>> getAllManga() {
        List<MangaResponse> mangaList = mangaService.getAll();
        return ApiResponse.<List<MangaResponse>>builder()
                .data(mangaList)
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<MangaResponse> getMangaById(String id) {
        MangaResponse manga = mangaService.getById(id);
        return ApiResponse.<MangaResponse>builder()
                .data(manga)
                .build();
    }

    @PostMapping
    ApiResponse<MangaResponse> createManga(@RequestBody MangaCreateRequest mangaCreateRequest) {
        MangaResponse createdManga = mangaService.createManga(mangaCreateRequest);
        return ApiResponse.<MangaResponse>builder()
                .data(createdManga)
                .build();
    }
}
