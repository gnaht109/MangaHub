package com.mangahub.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mangahub.backend.dto.request.OrderCreateRequest;
import com.mangahub.backend.dto.request.OrderPayRequest;
import com.mangahub.backend.dto.response.OrderResponse;
import com.mangahub.backend.enums.FlashSaleStatus;
import com.mangahub.backend.enums.OrderStatus;
import com.mangahub.backend.exception.AppException;
import com.mangahub.backend.exception.ErrorCode;
import com.mangahub.backend.mapper.OrderMapper;
import com.mangahub.backend.model.Cart;
import com.mangahub.backend.model.CartItem;
import com.mangahub.backend.model.FlashSale;
import com.mangahub.backend.model.FlashSaleItem;
import com.mangahub.backend.model.Manga;
import com.mangahub.backend.model.Order;
import com.mangahub.backend.model.OrderItem;
import com.mangahub.backend.model.User;
import com.mangahub.backend.repository.CartRepository;
import com.mangahub.backend.repository.OrderRepository;
import com.mangahub.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    
    OrderRepository orderRepository;
    UserRepository userRepository;
    CartRepository cartRepository;
    OrderMapper mapper;

    @Transactional 
    public OrderResponse checkout(Long userId, OrderCreateRequest request) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Cart cart = cartRepository.findByUserId(userId)
        .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        // check if cart is empty

        if(cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        
        // 1. check if items are expired
        LocalDateTime now = LocalDateTime.now();


        boolean hasExpiredItems = cart.getItems()
                                .stream()
                                .anyMatch(item -> item.getReservedUntil() == null || !item.getReservedUntil().isAfter(now));

        if(hasExpiredItems) {
            cart.getItems().removeIf(item -> item.getReservedUntil() == null || !item.getReservedUntil().isAfter(now));
            cartRepository.save(cart);
            throw new AppException(ErrorCode.CART_RESERVATION_EXPIRED);
        }

        // 2. Make placeholder order (PENDING status)
        Order order = Order.builder()
                    .customer(user)
                    .status(OrderStatus.PENDING)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for(CartItem cartItem : cart.getItems()) {
            Manga manga = cartItem.getManga();
            FlashSaleItem flashSaleItem = cartItem.getFlashSaleItem();
            int qty = cartItem.getQuantity();

            // prevent oversale
            // if(manga.getStockQuantity() < qty) {
            //     throw new AppException(ErrorCode.OUT_OF_STOCK);
            // }

            // copy price snapshot at checkout time (so that future prices won't change past orders)
            BigDecimal originalPrice = manga.getBasePrice();
            BigDecimal unitPrice;

            // if item is on sale
            if(flashSaleItem != null) {

                // check if item is still on sale
                FlashSale flashSale = flashSaleItem.getFlashSale();
                boolean isActive = flashSale.getStatus() != FlashSaleStatus.CANCELLED
                && !LocalDate.now().isBefore(flashSale.getStartDate())
                && !LocalDate.now().isAfter(flashSale.getEndDate());

                if(!isActive) {
                    throw new AppException(ErrorCode.FLASH_SALE_ALREADY_ENDED);
                }

                // prevent oversale
                // int remainingSale = flashSaleItem.getSaleQuantityLimit() - flashSaleItem.getQuantitySold();
                // if(remainingSale < qty) {
                //     throw new AppException(ErrorCode.FLASH_SALE_ITEM_OUT_OF_STOCK);
                // }

                BigDecimal discountedPrice = flashSaleItem.getDiscountedPrice();
                unitPrice = discountedPrice;
                
                // // track how many sale items has been sold
                // flashSaleItem.setQuantitySold(flashSaleItem.getQuantitySold() + qty);
            } else {
                // normal price
                unitPrice = originalPrice;
            }

            // calculate subtotal for each item (then add to total)
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            totalAmount = totalAmount.add(subtotal);

            // Create OrderItem
            OrderItem orderItem = OrderItem.builder()
                    .manga(manga)
                    .flashSaleItem(flashSaleItem)
                    .quantity(qty)
                    .originalPrice(originalPrice)
                    // .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            // Add OrderItem into Order
            order.addItem(orderItem);
        }
        // save total amount
        order.setTotalAmount(totalAmount);
        
        // 3. Save order
        Order savedOrder = orderRepository.save(order);

        return mapper.toOrderResponse(savedOrder);
    }

    // Confirm payment -> deduct stock, clear cart, set CONFIRMED
    @Transactional
    public OrderResponse confirmPayment(Long userId, Long orderId, OrderPayRequest request) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, userId)
        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // safety check
        if(order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER);
        }

        if(request.getShippingAddress() == null || request.getShippingAddress().isBlank() || request.getPaymentMethod() == null) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }




        for(OrderItem item : order.getItems()) {
            Manga manga = item.getManga();
            FlashSaleItem flashSaleItem = item.getFlashSaleItem();
            int qty = item.getQuantity();

            if(flashSaleItem != null) {
                // flashSaleItem.setQuantitySold(flashSaleItem.getQuantitySold() + qty);
            }

            // manga.setStockQuantity(manga.getStockQuantity() - qty);
        }
        
        // set shipping address, set payment method -> confirm order
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.CONFIRMED);

        // release the item from cart
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

        return mapper.toOrderResponse(order);
    }

    @Transactional 
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, userId)
        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // check if order is pending or confirmed
        if(order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        // restore physical stock and decrement flash sale quantity sold
        for(OrderItem item : order.getItems()) {
            Manga manga = item.getManga();
            // manga.setStockQuantity(manga.getStockQuantity() + item.getQuantity());

            FlashSaleItem flashSaleItem = item.getFlashSaleItem();
            if(flashSaleItem != null) {
                // int restoreSold = Math.max(0, flashSaleItem.getQuantitySold() - item.getQuantity());
                // flashSaleItem.setQuantitySold(restoreSold);
            }
        }

        // set order status to CANCELLED
        order.setStatus(OrderStatus.CANCELLED);
        return mapper.toOrderResponse(order);
    }


    public List<OrderResponse> getMyOrders(Long userId) {
        return mapper.toOrderResponses(orderRepository.findByCustomerIdOrderByOrderDateDesc(userId));
    }

    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, userId)
        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return mapper.toOrderResponse(order);
    }
}
