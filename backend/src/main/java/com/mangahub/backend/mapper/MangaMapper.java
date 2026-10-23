package com.mangahub.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.mangahub.backend.dto.request.MangaCreateRequest;
import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.model.Manga;

import com.mangahub.backend.dto.response.MangaResponse;
import com.mangahub.backend.model.Manga;

@Mapper(componentModel = "spring")
public interface MangaMapper {
    MangaMapper INSTANCE = Mappers.getMapper(MangaMapper.class);

    @Mapping(target = "id", ignore = true)
    Manga toEntityManga(MangaCreateRequest request);


    MangaResponse toMangaResponse(Manga manga);

    List<MangaResponse> toMangaResponses(List<Manga> mangas);
}
