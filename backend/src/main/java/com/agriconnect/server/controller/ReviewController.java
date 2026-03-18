package com.agriconnect.server.controller;

import com.agriconnect.server.dto.ApiResponse;
import com.agriconnect.server.dto.ReviewDTO;
import com.agriconnect.server.dto.UserProfileDTO;
import com.agriconnect.server.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDTO>> submitReview(
            @RequestBody ReviewDTO reviewDTO,
            Authentication authentication) {
        ReviewDTO result = reviewService.submitReview(reviewDTO, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Review submitted successfully!"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getReviewsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewDTO> result = reviewService.getReviewsForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Reviews fetched!"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewDTO> result = reviewService.getMyReviews(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Your reviews fetched!"));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getReviewsForOrder(@PathVariable Long orderId) {
        List<ReviewDTO> result = reviewService.getReviewsForOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(result, "Order reviews fetched!"));
    }

    @GetMapping("/check/{orderId}")
    public ResponseEntity<ApiResponse<Boolean>> hasReviewed(
            @PathVariable Long orderId,
            Authentication authentication) {
        boolean reviewed = reviewService.hasReviewed(orderId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(reviewed, reviewed ? "Already reviewed" : "Not reviewed yet"));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfile(@PathVariable Long userId) {
        UserProfileDTO profile = reviewService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile fetched!"));
    }

    @GetMapping("/crop/{cropId}")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getReviewsForCrop(
            @PathVariable Long cropId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewDTO> result = reviewService.getReviewsForCrop(cropId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Crop reviews fetched!"));
    }
}
