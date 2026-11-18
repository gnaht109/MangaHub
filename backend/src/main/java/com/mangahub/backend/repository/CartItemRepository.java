package com.mangahub.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mangahub.backend.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long>{
  
    public interface ReservedCount {
      Long getMangaId();
      int getCount();
    }

    public interface ReservedFlashSaleCount {
      Long getFlashSaleItemId();
      int getCount();
    }
    @Query("""
        SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci
        WHERE ci.manga.id = :mangaId
          AND ci.flashSaleItem IS NULL
          AND ci.reservedUntil > :now
    """)
    int countReservedRegularStock(@Param("mangaId") Long mangaId, @Param("now") LocalDateTime now);
  
    @Query("""
        SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci
        WHERE ci.manga.id = :mangaId
          AND ci.flashSaleItem IS NULL
          AND ci.reservedUntil > :now
          AND ci.id <> :cartItemId
    """)
    int stockReservedByOthers(@Param("mangaId") Long mangaId, @Param("now") LocalDateTime now, @Param("cartItemId") Long cartItemId);

    @Query("""
        SELECT ci.manga.id AS mangaId, COALESCE(SUM(ci.quantity), 0) AS count
        FROM CartItem ci
        WHERE ci.flashSaleItem IS NULL AND ci.reservedUntil > :now
        GROUP BY ci.manga.id
    """)
    List<ReservedCount> findAllReservedRegularStock(@Param("now") LocalDateTime now);


    @Query("""
        SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci
        WHERE ci.flashSaleItem.id = :flashSaleItemId
          AND ci.reservedUntil > :now
    """)
    int countReservedFlashSaleStock(@Param("flashSaleItemId") Long flashSaleItemId, @Param("now") LocalDateTime now);

    @Query("""
        SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci
        WHERE ci.flashSaleItem.id = :flashSaleItemId
          AND ci.reservedUntil > :now
          AND ci.id <> :cartItemId
    """)
    int flashSaleStockReservedByOthers(@Param("flashSaleItemId") Long flashSaleItemId, @Param("now") LocalDateTime now, @Param("cartItemId") Long cartItemId);



    @Query("""
        SELECT ci.flashSaleItem.id AS flashSaleItemId, COALESCE(SUM(ci.quantity), 0) AS count
        FROM CartItem ci
        WHERE ci.flashSaleItem.id IN :flashSaleItemIds
          AND ci.reservedUntil > :now
        GROUP BY ci.flashSaleItem.id
    """)
    List<ReservedFlashSaleCount> findReservedFlashSaleStockByIds(
        @Param("flashSaleItemIds") List<Long> flashSaleItemIds,
        @Param("now") LocalDateTime now
    );


    // delete all manga items from cart when a manga is deleted
    @Modifying 
    @Query("DELETE FROM CartItem ci WHERE ci.manga.id = :mangaId")
    void deleteByMangaId(@Param("mangaId") Long mangaId);

    // delete expired cart items
    @Modifying 
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.reservedUntil <= :now")
    void deleteExpiredByCartId(@Param("cartId") Long cartId, @Param("now") LocalDateTime now);
}