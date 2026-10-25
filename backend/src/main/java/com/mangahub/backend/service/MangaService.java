package com.mangahub.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.MangaCreateRequest;
import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.exception.AppException;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.mapper.MangaMapper;
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
    MangaMapper mangaMapper;

    public MangaResponse createManga(MangaCreateRequest mangaCreateRequest) {
        String title = mangaCreateRequest.getTitle().trim();
        if (mangaRepository.existsByTitle(title)) {
            throw new AppException(ErrorCode.MANGA_ALREADY_EXISTS);
        }
        Manga manga = mangaMapper.toEntityManga(mangaCreateRequest);

        Manga savedManga = mangaRepository.save(manga);

        return mangaMapper.toMangaResponse(savedManga);
    }

    public List<MangaResponse> getAll(){

        return mangaMapper.toMangaResponses(mangaRepository.findAll());

    }

    public MangaResponse getById(Long id) {
        Manga manga = mangaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));
        return mangaMapper.toMangaResponse(manga);
    }

}
