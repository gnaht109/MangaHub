package com.mangahub.backend.service;

import com.mangahub.backend.dto.request.LoginRequest;
import com.mangahub.backend.dto.request.RegisterRequest;
import com.mangahub.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
