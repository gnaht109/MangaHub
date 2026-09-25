package com.mangahub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.MangaCreateRequest;
import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.repository.MangaRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MangaService {

    MangaRepository mangaRepository;

    public MangaResponse createManga(MangaCreateRequest mangaCreateRequest) {
        Manga manga = Manga.builder()
                .title(mangaCreateRequest.getTitle())
                .author(mangaCreateRequest.getAuthor())
                .description(mangaCreateRequest.getDescription())
                .basePrice(mangaCreateRequest.getBasePrice())
                .build();

        Manga savedManga = mangaRepository.save(manga);

        return MangaResponse.builder()
                .id(savedManga.getId())
                .title(savedManga.getTitle())
                .author(savedManga.getAuthor())
                .description(savedManga.getDescription())
                .basePrice(savedManga.getBasePrice())
                .build();
    }

    public List<MangaResponse> getAll(){
        return mangaRepository.findAll().stream()
                .map(manga -> MangaResponse.builder()
                        .id(manga.getId())
                        .title(manga.getTitle())
                        .author(manga.getAuthor())
                        .description(manga.getDescription())
                        .basePrice(manga.getBasePrice())
                        .build())
                .toList();
    }

    public MangaResponse getById(String id) {
        return mangaRepository.findById(id)
                .map(manga -> MangaResponse.builder()
                        .id(manga.getId())
                        .title(manga.getTitle())
                        .author(manga.getAuthor())
                        .description(manga.getDescription())
                        .basePrice(manga.getBasePrice())
                        .build())
                .orElseThrow(() -> new RuntimeException("Manga not found with id: " + id));
    }

}
