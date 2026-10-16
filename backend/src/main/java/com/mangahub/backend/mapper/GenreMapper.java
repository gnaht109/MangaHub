package com.mangahub.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.mangahub.backend.dto.request.GenreCreateRequest;
import com.mangahub.backend.dto.response.GenreResponse;
import com.mangahub.backend.model.Genre;

@Mapper(componentModel = "spring")
public interface GenreMapper {
    GenreMapper INSTANCE = Mappers.getMapper(GenreMapper.class);

    @Mapping(target = "id", ignore = true)
    Genre toEntityGenre(GenreCreateRequest request);

    GenreResponse toGenreResponse(Genre genre);

    List<GenreResponse> toGenreResponses(List<Genre> genres);
}
