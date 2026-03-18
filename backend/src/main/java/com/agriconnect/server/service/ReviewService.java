package com.agriconnect.server.service;

import com.agriconnect.server.dto.ReviewDTO;
import com.agriconnect.server.dto.UserProfileDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {
    ReviewDTO submitReview(ReviewDTO reviewDTO, String email);
    Page<ReviewDTO> getReviewsForUser(Long userId, Pageable pageable);
    Page<ReviewDTO> getMyReviews(String email, Pageable pageable);
    List<ReviewDTO> getReviewsForOrder(Long orderId);
    boolean hasReviewed(Long orderId, String email);
    Page<ReviewDTO> getReviewsForCrop(Long cropId, Pageable pageable);
    UserProfileDTO getUserProfile(Long userId);
}
