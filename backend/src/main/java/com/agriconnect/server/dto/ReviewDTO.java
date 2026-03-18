package com.agriconnect.server.dto;

import com.agriconnect.server.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Long reviewerId;
    private String reviewerName;
    private Long revieweeId;
    private String revieweeName;
    private Long orderId;
    private Long cropId;
    private String cropName;
    private Integer rating;
    private String comment;
    private Review.ReviewType type;
    private LocalDateTime createdAt;
}
