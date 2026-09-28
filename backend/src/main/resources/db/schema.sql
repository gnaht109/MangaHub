-- =====================================================================
-- Migration: V1__create_manga_shop_schema.sql
-- Target: MySQL 8.0+
--
-- Maps the class diagram: User (with a Role) -- Administrator / Customer
-- Assumptions made (change if they don't fit your setup):
--   1. Single-table design: administrators and customers are just Users
--      with role = 'ADMINISTRATOR' or 'CUSTOMER'. No separate subclass
--      tables. shipping_address is nullable and only ever populated for
--      customer rows.
--   2. Every "-string id" in the diagram is a UUID, generated with
--      MySQL 8's DEFAULT (UUID()) expression. Swap to
--      `BIGINT AUTO_INCREMENT` everywhere if you'd rather use surrogate
--      integer keys.
--   3. Money fields are DECIMAL(10,2); adjust precision if you expect
--      larger amounts.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS mangahub
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mangahub;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Users (single table, role-based)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                VARCHAR(36)  NOT NULL DEFAULT (UUID()),
    name              VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    role              ENUM('ADMINISTRATOR', 'CUSTOMER') NOT NULL,
    shipping_address  VARCHAR(500) NULL,  -- customer-only; NULL for administrators
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Catalog: Manga, Genre, and their many-to-many join
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
    id   VARCHAR(36)  NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_genres_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS manga (
    id           VARCHAR(36)   NOT NULL DEFAULT (UUID()),
    title        VARCHAR(255)  NOT NULL,
    author       VARCHAR(255)  NOT NULL,
    description  TEXT          NULL,
    price        DECIMAL(10,2) NOT NULL,
    cover_image  VARCHAR(500)  NULL,
    quantity     INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT chk_manga_price_nonnegative CHECK (price >= 0),
    CONSTRAINT chk_manga_quantity_nonnegative CHECK (quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS manga_genres (
    manga_id VARCHAR(36) NOT NULL,
    genre_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (manga_id, genre_id),
    CONSTRAINT fk_manga_genres_manga
        FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE,
    CONSTRAINT fk_manga_genres_genre
        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Flash sales
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flash_sales (
    id         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
    name       VARCHAR(255) NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    status     VARCHAR(50)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT chk_flash_sales_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS flash_sale_items (
    id                  VARCHAR(36)   NOT NULL DEFAULT (UUID()),
    flash_sale_id       VARCHAR(36)   NOT NULL,
    manga_id            VARCHAR(36)   NOT NULL,
    discounted_price    DECIMAL(10,2) NOT NULL,
    sale_quantity_limit INT           NOT NULL,
    quantity_sold       INT           NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_flash_sale_items_sale
        FOREIGN KEY (flash_sale_id) REFERENCES flash_sales (id) ON DELETE CASCADE,
    CONSTRAINT fk_flash_sale_items_manga
        FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE,
    UNIQUE KEY uq_flash_sale_manga (flash_sale_id, manga_id),
    CONSTRAINT chk_flash_sale_items_qty CHECK (quantity_sold <= sale_quantity_limit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Cart (a Customer owns 0..1 Cart)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
    id          VARCHAR(36) NOT NULL DEFAULT (UUID()),
    customer_id VARCHAR(36) NOT NULL,  -- users.id where role = 'CUSTOMER'
    PRIMARY KEY (id),
    UNIQUE KEY uq_carts_customer (customer_id),  -- enforces the 0..1 cart-per-customer rule
    CONSTRAINT fk_carts_customer
        FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
    id       VARCHAR(36) NOT NULL DEFAULT (UUID()),
    cart_id  VARCHAR(36) NOT NULL,
    manga_id VARCHAR(36) NOT NULL,
    quantity INT         NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_manga
        FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE CASCADE,
    UNIQUE KEY uq_cart_manga (cart_id, manga_id),
    CONSTRAINT chk_cart_items_qty_positive CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Orders (a Customer places many Orders)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id            VARCHAR(36)   NOT NULL DEFAULT (UUID()),
    customer_id   VARCHAR(36)   NOT NULL,  -- users.id where role = 'CUSTOMER'
    order_date    DATE          NOT NULL,
    status        VARCHAR(50)   NOT NULL,
    total_amount  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_orders_total_nonnegative CHECK (total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
    id                 VARCHAR(36)   NOT NULL DEFAULT (UUID()),
    order_id           VARCHAR(36)   NOT NULL,
    manga_id           VARCHAR(36)   NOT NULL,
    quantity           INT           NOT NULL,
    price_at_purchase  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_manga
        FOREIGN KEY (manga_id) REFERENCES manga (id) ON DELETE RESTRICT,
    CONSTRAINT chk_order_items_qty_positive CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Helpful indexes on the FK columns MySQL doesn't auto-index
-- ---------------------------------------------------------------------
CREATE INDEX idx_manga_genres_genre        ON manga_genres (genre_id);
CREATE INDEX idx_flash_sale_items_manga    ON flash_sale_items (manga_id);
CREATE INDEX idx_cart_items_manga          ON cart_items (manga_id);
CREATE INDEX idx_order_items_manga         ON order_items (manga_id);
CREATE INDEX idx_orders_customer           ON orders (customer_id);

SET FOREIGN_KEY_CHECKS = 1;