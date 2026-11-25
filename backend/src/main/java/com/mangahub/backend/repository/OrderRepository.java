package com.mangahub.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.mangahub.backend.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "items.manga", "items.flashSaleItem"})
    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);
    

    // prevent users from looking at other user's orders
    @EntityGraph(attributePaths = {"items", "items.manga", "items.flashSaleItem"})
    Optional<Order> findByIdAndCustomerId(Long id, Long userId);
}