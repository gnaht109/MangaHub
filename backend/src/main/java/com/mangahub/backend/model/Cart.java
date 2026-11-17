package com.mangahub.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.mangahub.backend.enums.CartStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "cart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cart {
    @Id 
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(length = 36, updatable = false, nullable = false)
    Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<CartItem> items = new ArrayList<>();

    // ------------------Helper methods------------------//
        public void addOrIncreaseItem(Manga manga, FlashSaleItem flashSaleItem, int quantity, LocalDateTime reservedUntil) {
        findItem(manga.getId(), flashSaleItem).ifPresentOrElse(
            existing -> existing.setQuantity(existing.getQuantity() + quantity),
            () -> {
                CartItem item = new CartItem();
                item.setCart(this);
                item.setManga(manga);
                item.setFlashSaleItem(flashSaleItem);
                item.setQuantity(quantity);
                item.setReservedUntil(reservedUntil);
                items.add(item);
            });
    }

    public Optional<CartItem> findItem(Long mangaId, FlashSaleItem flashSaleItem) {
        Long targetFlashItemId = (flashSaleItem == null) ? null : flashSaleItem.getId();
        
        return items.stream()
            .filter(i -> i.getManga().getId().equals(mangaId))
            .filter(i -> {
                Long cartFlashItemId = (i.getFlashSaleItem() == null) ? null : i.getFlashSaleItem().getId();
                return Objects.equals(cartFlashItemId, targetFlashItemId);
            })
            .findFirst();
    }

    public Optional<CartItem> findItemById(Long cartItemId) {        
        return items.stream()
            .filter(i -> Objects.equals(i.getId(), cartItemId))
            .findFirst();
    }

    public boolean removeItemById(Long cartItemId){
        return items.removeIf(i -> Objects.equals(i.getId(), cartItemId));
    }
}
