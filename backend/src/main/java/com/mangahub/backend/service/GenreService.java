package com.mangahub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.GenreCreateRequest;
import com.mangahub.backend.dto.response.GenreResponse;
import com.mangahub.backend.exception.AppException;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.mapper.GenreMapper;
import com.mangahub.backend.model.Genre;
import com.mangahub.backend.repository.GenreRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) 
public class GenreService {

    GenreMapper genreMapper;
    GenreRepository genreRepository;

    public List<GenreResponse> getAll() {
        return genreMapper.toGenreResponses(genreRepository.findAllByOrderByNameAsc());
    }

    public GenreResponse createGenre(GenreCreateRequest request) {
        request.setName(request.getName().trim());

        if(genreRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.GENRE_ALREADY_EXISTS);
        }

        Genre saved = genreRepository.save(genreMapper.toEntityGenre(request));

        return genreMapper.toGenreResponse(saved);
    }
}
