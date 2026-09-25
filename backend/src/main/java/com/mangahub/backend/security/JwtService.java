package com.mangahub.backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service 
public class JwtService {
    

    public String generateToken(UserDetails userDetails) {
        
        return "";
    }
}
