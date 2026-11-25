package com.mangahub.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.mangahub.backend.enums.OrderStatus;
import com.mangahub.backend.enums.PaymentMethod;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity 
@Table(name = "orders")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(updatable = false, nullable = false)
    Long id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    User customer;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    OrderStatus status = OrderStatus.PENDING;


    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    BigDecimal totalAmount;

    @Column(name = "order_date", nullable = false)
    LocalDate orderDate;

    @Column(name = "shipping_address")
    String shippingAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    PaymentMethod paymentMethod;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderItem> items = new ArrayList<>();


    @PrePersist 
    protected void onCreate() {
        if(this.orderDate == null) {
            this.orderDate = LocalDate.now();
        }
    }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }
}
