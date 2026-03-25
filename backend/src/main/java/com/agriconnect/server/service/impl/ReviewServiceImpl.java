package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.ReviewDTO;
import com.agriconnect.server.dto.UserProfileDTO;
import com.agriconnect.server.entity.*;
import com.agriconnect.server.repository.*;
import com.agriconnect.server.service.NotificationService;
import com.agriconnect.server.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public ReviewDTO submitReview(ReviewDTO reviewDTO, String email) {
        User reviewer = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Reviewer not found"));

        // Check if already reviewed this order
        if (reviewRepository.existsByOrderIdAndReviewerId(reviewDTO.getOrderId(), reviewer.getId())) {
            throw new RuntimeException("You have already reviewed this order.");
        }

        Order order = orderRepository.findById(reviewDTO.getOrderId()).orElseThrow(
                () -> new RuntimeException("Order not found"));

        // Allow reviews for any status except PENDING and CANCELLED
        if (order.getStatus() == Order.OrderStatus.PENDING || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Orders can be reviewed once they are paid.");
        }

        User reviewee = userRepository.findById(reviewDTO.getRevieweeId()).orElseThrow(
                () -> new RuntimeException("Reviewee not found"));

        // Validate rating
        if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5.");
        }

        // Determine review type
        Review.ReviewType type;
        if (reviewer.getRole() == RoleType.ROLE_BUYER) {
            type = Review.ReviewType.BUYER_TO_FARMER;
        } else if (reviewer.getRole() == RoleType.ROLE_FARMER) {
            type = Review.ReviewType.FARMER_TO_BUYER;
        } else {
            type = reviewDTO.getType() != null ? reviewDTO.getType() : Review.ReviewType.BUYER_TO_FARMER;
        }

        Crop crop = null;
        if (reviewDTO.getCropId() != null) {
            crop = cropRepository.findById(reviewDTO.getCropId()).orElse(null);
        }

        Review review = Review.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .order(order)
                .crop(crop)
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .type(type)
                .build();

        Review saved = reviewRepository.save(review);

        // Update Crop's average rating if applicable
        if (crop != null) {
            Double avg = reviewRepository.getAverageRatingForCrop(crop.getId());
            if (avg != null) {
                crop.setAverageRating(Math.round(avg * 10.0) / 10.0);
                cropRepository.save(crop);
            }
        }

        // Send notification to reviewee
        notificationService.createNotification(
                reviewee,
                "New Review Received",
                String.format("%s gave you a %d-star review on Order #%d.",
                        reviewer.getFullName(), reviewDTO.getRating(), order.getId()),
                "REVIEW",
                "/reviews");

        return mapToDTO(saved);
    }

    @Override
    public Page<ReviewDTO> getReviewsForUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("User not found"));
        return reviewRepository.findByRevieweeOrderByCreatedAtDesc(user, pageable).map(this::mapToDTO);
    }

    @Override
    public Page<ReviewDTO> getMyReviews(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));
        return reviewRepository.findByReviewerOrderByCreatedAtDesc(user, pageable).map(this::mapToDTO);
    }

    @Override
    public List<ReviewDTO> getReviewsForOrder(Long orderId) {
        return reviewRepository.findByOrderId(orderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasReviewed(Long orderId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return reviewRepository.existsByOrderIdAndReviewerId(orderId, user.getId());
    }

    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new RuntimeException("User not found"));
        Double avgRating = reviewRepository.getAverageRatingForUser(userId);
        Long reviewCount = reviewRepository.getReviewCountForUser(userId);

        return UserProfileDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .profileImageUrl(user.getProfileImageUrl())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalReviews(reviewCount != null ? reviewCount : 0L)
                .build();
    }
    
    @Override
    public Page<ReviewDTO> getReviewsForCrop(Long cropId, Pageable pageable) {
        return reviewRepository.findByCropIdOrderByCreatedAtDesc(cropId, pageable).map(this::mapToDTO);
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFullName())
                .revieweeId(review.getReviewee().getId())
                .revieweeName(review.getReviewee().getFullName())
                .orderId(review.getOrder().getId())
                .cropId(review.getCrop() != null ? review.getCrop().getId() : null)
                .cropName(review.getCrop() != null ? review.getCrop().getName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .type(review.getType())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
