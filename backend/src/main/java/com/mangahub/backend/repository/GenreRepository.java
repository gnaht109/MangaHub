package com.mangahub.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mangahub.backend.model.Genre;

public interface GenreRepository extends JpaRepository<Genre, String> {
    
    boolean existsByNameIgnoreCase(String name);
    List<Genre> findAllByOrderByNameAsc();
}
