package com.mangahub.backend.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "manga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Manga {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, updatable = false, nullable = false)
    private String id;
 
    @Column(nullable = false)
    private String title;
 
    @Column(nullable = false)
    private String author;
 
    @Column(columnDefinition = "TEXT")
    private String description;
 
    // The normal catalog price, separate from whatever discounted price
    // a FlashSaleItem gives it during a specific event.
    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal basePrice;
}

