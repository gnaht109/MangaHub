package com.mangahub.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.AddCartItemRequest;
import com.mangahub.backend.dto.response.CartResponse;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.repository.CartRepository;
import com.mangahub.backend.repository.MangaRepository;
import com.mangahub.backend.mapper.CartMapper;
import com.mangahub.backend.exception.AppException;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import com.mangahub.backend.model.Cart;
import com.mangahub.backend.model.CartItem;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.repository.UserRepository;

@Service
@Transactional 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {
    CartRepository cartRepository;
    MangaRepository mangaRepository;
    UserRepository userRepository;
    //UserDetailsImpl userDetailsImpl;
    CartMapper cartMapper;

    @Transactional 
    public CartResponse getCart(Long userId){
        Cart cart = findOrCreateCart(userId);
        return cartMapper.toCartResponse(cart);
    }

    @Transactional 
    public CartResponse addItem(Long userId, AddCartItemRequest request){
        Manga manga = mangaRepository.findById(request.getMangaId())
                .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));
        Cart cart = findOrCreateCart(userId);
        cart.addOrIncreaseItem(manga, request.getQuantity());
        return cartMapper.toCartResponse(cart);
    }

    @Transactional 
    public CartResponse removeItem(Long userId, Long mangaId){
        Cart cart = findOrCreateCart(userId);
        cart.removeItem(mangaId);
        return cartMapper.toCartResponse(cart);
    }

    //---------------private helpers-----------------//
    private Cart findOrCreateCart(Long userId){
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
                    return cartRepository.save(newCart);
                });
    }



    

}
