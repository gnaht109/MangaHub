package com.mangahub.backend.mapper;

import java.util.List;
import java.util.Map;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.mangahub.backend.dto.request.MangaCreateRequest;
import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.model.Manga;


@Mapper(componentModel = "spring")
public interface MangaMapper {
    MangaMapper INSTANCE = Mappers.getMapper(MangaMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "stockQuantity", defaultValue = "0")
    Manga toEntityManga(MangaCreateRequest request);

    @Mapping(target = "availableStock", expression = "java(Math.max(0, manga.getStockQuantity() - reservedStock))")
    MangaResponse toMangaResponse(Manga manga, int reservedStock);

    default List<MangaResponse> toMangaResponses(List<Manga> mangas, Map<Long, Integer> reservedMap) {
        return mangas.stream()
                .map(manga -> toMangaResponse(manga, reservedMap.getOrDefault(manga.getId(), 0)))
                .toList();
    }
}
