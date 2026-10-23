package com.mangahub.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mangahub.backend.model.CartItem;
import java.util.Optional;

import com.mangahub.backend.model.Cart;

public interface CartRepository extends JpaRepository<Cart, String> {
    Cart findByUserId(String userId);
    //Optional<CartItem> findByUserIdAndMangaId(String id, String mangaId);

}
