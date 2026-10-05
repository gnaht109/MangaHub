package com.mangahub.backend.service;

import org.springframework.stereotype.Service;

import com.mangahub.backend.repository.CartRepository;
import com.mangahub.backend.repository.MangaRepository;
import com.mangahub.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {
    CartRepository cartRepository;
    UserRepository userRepository;
    MangaRepository mangaRepository;
}
