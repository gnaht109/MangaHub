package com.mangahub.backend.service;

import com.mangahub.backend.repository.UserRepository;
import com.mangahub.backend.security.CustomUserDetailsService;
import com.mangahub.backend.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.mangahub.backend.dto.request.LoginRequest;
import com.mangahub.backend.dto.request.RegisterRequest;
import com.mangahub.backend.dto.response.AuthResponse;
import com.mangahub.backend.model.User;
import com.mangahub.backend.model.UserRole;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 
public class AuthServiceImpl implements AuthService{
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    @Override 
    @Transactional 
    public AuthResponse register(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(UserRole.CUSTOMER)
                    .build();

        User saved = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(userDetails);

        return toAuthResponse(user, token);
    }

    @Override 
    public AuthResponse login(LoginRequest request) {
        // throws BadCredentialsException on bad email/password, handled by GlobalExceptionHandler
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User disappeared after authenticated"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return toAuthResponse(user, token);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .build();
    }
}
