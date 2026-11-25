package com.mangahub.backend.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;


@Entity
@Table(name = "order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manga_id", nullable = false)
    Manga manga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flash_sale_item_id")
    FlashSaleItem flashSaleItem;

    @Column(nullable = false)
    Integer quantity;

    // Snapshot of manga.basePrice at purchase time
    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    BigDecimal originalPrice;

    // flashSaleItem.discountedPrice if on sale, else manga.basePrice
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    BigDecimal unitPrice;

    @Column(precision = 10, scale = 2, nullable = false)
    BigDecimal subtotal;
}
