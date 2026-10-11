package com.mangahub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenreCreateRequest {
    @NotBlank(message = "Genre name is required")
    @Size(max = 50, message = "Genre name cannot be longer than 50 characters")
    String name;
}
