package com.mangahub.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mangahub.backend.model.FlashSale;
import java.util.Optional;
import java.util.List;
import java.time.LocalDate;



public interface FlashSaleRepository extends JpaRepository<FlashSale, String> {

    boolean existsByNameIgnoreCase(String name);

    // Load flash sale items
    @Override 
    @EntityGraph(attributePaths = "items")
    Optional<FlashSale> findById(String id);


    @EntityGraph(attributePaths = "items")
    List<FlashSale> findAllByOrderByStartDateDesc();
    
    // Sales running on the given day, matched by dates rather than the stored status
    @EntityGraph(attributePaths = "items")
    @Query("""
            SELECT f FROM FlashSale f
            WHERE f.startDate <= :today AND f.endDate >= :today
            ORDER BY f.endDate ASC
            """)
    List<FlashSale> findActiveOn(@Param("today") LocalDate today);
}
