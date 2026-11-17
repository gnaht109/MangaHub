package com.mangahub.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mangahub.backend.model.FlashSaleItem;

public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Long>{
    
    @Override
    @EntityGraph(attributePaths = {"manga", "flashSale"})
    Optional<FlashSaleItem> findById(Long id);

    @Modifying 
    @Query("DELETE FROM FlashSaleItem fsi WHERE fsi.manga.id = :mangaId")
    void deleteAllById(@Param("mangaId") Long mangaId);
}
