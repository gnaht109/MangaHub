package com.mangahub.backend.mapper;

import org.mapstruct.Mapper;

import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.model.Manga;

@Mapper(componentModel = "spring")
public interface MangaMapper {
    MangaResponse toMangaResponse(Manga manga);
}
