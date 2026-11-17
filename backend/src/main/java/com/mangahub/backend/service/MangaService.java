package com.mangahub.backend.service;

import com.mangahub.backend.repository.CartItemRepository;
import com.mangahub.backend.repository.FlashSaleItemRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.MangaCreateRequest;
import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.exception.AppException;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.mapper.MangaMapper;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.repository.MangaRepository;
import com.mangahub.backend.repository.CartItemRepository.ReservedCount;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MangaService {

    private final FlashSaleItemRepository flashSaleItemRepository;
    private final CartItemRepository cartItemRepository;
    MangaRepository mangaRepository;
    MangaMapper mangaMapper;


    @Transactional 
    public MangaResponse createManga(MangaCreateRequest mangaCreateRequest) {
        String title = mangaCreateRequest.getTitle().trim();
        if (mangaRepository.existsByTitle(title)) {
            throw new AppException(ErrorCode.MANGA_ALREADY_EXISTS);
        }
        Manga manga = mangaMapper.toEntityManga(mangaCreateRequest);

        Manga savedManga = mangaRepository.save(manga);

        return mangaMapper.toMangaResponse(savedManga, 0);
    }

    @Transactional 
    public void deleteManga(Long mangaId) {
        Manga manga = mangaRepository.findById(mangaId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));

        // clean up cart items and flash sale items to prevent foreign key constraints
        cartItemRepository.deleteAllById(mangaId);
        flashSaleItemRepository.deleteAllById(mangaId);

        mangaRepository.delete(manga);
    }

    public List<MangaResponse> getAll(){

            Map<Long, Integer> reservedMap = cartItemRepository.findAllReservedRegularStock(LocalDateTime.now())
            .stream()
            .collect(Collectors.toMap(
                rc -> rc.getMangaId(),
                rc -> rc.getCount()
            ));

        return mangaMapper.toMangaResponses(mangaRepository.findAll(), reservedMap);

    }

    public MangaResponse getById(Long id) {
        Manga manga = mangaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));

        int reserved = cartItemRepository.countReservedRegularStock(manga.getId(), LocalDateTime.now());
        return mangaMapper.toMangaResponse(manga, reserved);
    }

}
