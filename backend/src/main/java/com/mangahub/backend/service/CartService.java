package com.mangahub.backend.service;

import com.mangahub.backend.repository.FlashSaleItemRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.AddCartItemRequest;
import com.mangahub.backend.dto.response.CartResponse;
import com.mangahub.backend.enums.FlashSaleStatus;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.repository.CartItemRepository;
import com.mangahub.backend.repository.CartRepository;
import com.mangahub.backend.repository.MangaRepository;
import com.mangahub.backend.mapper.CartMapper;
import com.mangahub.backend.exception.AppException;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import com.mangahub.backend.model.Cart;
import com.mangahub.backend.model.CartItem;
import com.mangahub.backend.model.FlashSale;
import com.mangahub.backend.model.FlashSaleItem;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.repository.UserRepository;

@Service
@Transactional 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {
    FlashSaleItemRepository flashSaleItemRepository;
    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    MangaRepository mangaRepository;
    UserRepository userRepository;
    CartMapper cartMapper;
    EntityManager entityManager;

    private final int RESERVATION_MINUTES = 15;

    @Transactional 
    public CartResponse getCart(Long userId){
        Cart cart = findOrCreateCart(userId);
        cartItemRepository.deleteExpiredByCartId(cart.getId(), LocalDateTime.now());
        entityManager.refresh(cart);
        return cartMapper.toCartResponse(cart);
    }

    @Transactional 
    public CartResponse addItem(Long userId, AddCartItemRequest request){
        Cart cart = findOrCreateCart(userId);
        Manga manga = mangaRepository.findById(request.getMangaId())
                .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));
        
        FlashSaleItem flashSaleItem = null;
        Long flashSaleItemId = request.getFlashSaleItemId();

        LocalDateTime now = LocalDateTime.now();

        // removes expired cart items when a user clicks add to cart
        cart.getItems().removeIf(i -> i.getReservedUntil() != null && i.getReservedUntil().isBefore(now));

        if(flashSaleItemId != null) {
            flashSaleItem = flashSaleItemRepository.findById(flashSaleItemId)
            .orElseThrow(() -> new AppException(ErrorCode.FLASH_SALE_NOT_FOUND));
            
            // makes sure the flash sale item is the same manga they're buying
            if(!flashSaleItem.getManga().getId().equals(manga.getId())) {
                throw new AppException(ErrorCode.INVALID_INPUT);
            }

            // check if item is still on sale
            FlashSale flashSale = flashSaleItem.getFlashSale();
            boolean isActive = flashSale.getStatus() != FlashSaleStatus.CANCELLED
            && !LocalDate.now().isBefore(flashSale.getStartDate())
            && !LocalDate.now().isAfter(flashSale.getEndDate());

            if (!isActive) {
                throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
            }            

            // int reservedCount = cartItemRepository.countReservedFlashSaleStock(flashSaleItem.getId(), now);
            // int maxStock = flashSaleItem.getSaleQuantityLimit();
            // int quantitySold = flashSaleItem.getQuantitySold();
            // int remainingStock = maxStock - quantitySold - reservedCount;

            // PREVENT OVERSELLING
            // if(request.getQuantity() > remainingStock) {
            //     throw new AppException(ErrorCode.FLASH_SALE_ITEM_OUT_OF_STOCK);
            // }

            cart.addOrIncreaseItem(flashSaleItem.getManga(), flashSaleItem, request.getQuantity(), now.plusMinutes(RESERVATION_MINUTES));
        } else{
            // int reservedCount = cartItemRepository.countReservedRegularStock(manga.getId(), now);
            // int currentStock = manga.getStockQuantity();
            // int remainingStock = currentStock - reservedCount;

            // // PREVENT OVERSELLING
            // if(request.getQuantity() > remainingStock) {
            //     throw new AppException(ErrorCode.FLASH_SALE_ITEM_OUT_OF_STOCK);
            // }

            cart.addOrIncreaseItem(manga, null, request.getQuantity(), now.plusMinutes(RESERVATION_MINUTES));
        }
        
        cart = cartRepository.saveAndFlush(cart);
        return cartMapper.toCartResponse(cart);
    }

    @Transactional 
    public CartResponse removeItem(Long userId, Long cartItemId){
        Cart cart = findOrCreateCart(userId);
        cart.removeItemById(cartItemId);
        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse updateQuantity(Long userId, Long cartItemId, int quantity){
        Cart cart = findOrCreateCart(userId);
        LocalDateTime now = LocalDateTime.now();

       // removes expired cart items when a user updates a cart item's quantity
        cart.getItems().removeIf(i -> i.getReservedUntil() != null && i.getReservedUntil().isBefore(now));

        CartItem item = cart.findItemById(cartItemId)
            .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        
        if (quantity == 0) {
            cart.removeItemById(cartItemId);
            return cartMapper.toCartResponse(cart);
        
        }
        FlashSaleItem flashSaleItem = item.getFlashSaleItem();
        int availableStock;

        if(flashSaleItem != null) {

            // count stocks being reserved by other carts
            // int reservedByOthers = cartItemRepository.flashSaleStockReservedByOthers(flashSaleItem.getId(), now, item.getId());
            // int maxStock = flashSaleItem.getSaleQuantityLimit();
            // int quantitySold = flashSaleItem.getQuantitySold();
            // availableStock = maxStock - quantitySold - reservedByOthers;
        } else {
            Manga manga = item.getManga();

            // count flash sale stocks being reserved by other carts
            // int reservedByOthers = cartItemRepository.stockReservedByOthers(manga.getId(), now, item.getId());
            // int maxStock = manga.getStockQuantity();

            // availableStock = maxStock - reservedByOthers;
        }


        // if(quantity > availableStock) {
        //     throw new AppException(ErrorCode.OUT_OF_STOCK);
        // }

        item.setQuantity(quantity);

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
