package com.mangahub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor 
@AllArgsConstructor
@Builder 
public class AuthResponse {
    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private String userId;
    private String fullName;
    private String email;
    private String role;
}
