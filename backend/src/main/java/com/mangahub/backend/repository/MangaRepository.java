package com.mangahub.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mangahub.backend.model.Manga;

public interface MangaRepository extends JpaRepository<Manga, Long> {
    
}
