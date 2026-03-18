package com.agriconnect.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String phoneNumber;
    private String address;
    private String profileImageUrl;
    private Double averageRating;
    private Long totalReviews;
}
