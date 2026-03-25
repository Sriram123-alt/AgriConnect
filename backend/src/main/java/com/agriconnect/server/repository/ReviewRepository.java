package com.agriconnect.server.repository;

import com.agriconnect.server.entity.Review;
import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByRevieweeOrderByCreatedAtDesc(User reviewee, Pageable pageable);

    Page<Review> findByReviewerOrderByCreatedAtDesc(User reviewer, Pageable pageable);

    List<Review> findByOrderId(Long orderId);

    Optional<Review> findByOrderIdAndReviewerId(Long orderId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double getAverageRatingForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId")
    Long getReviewCountForUser(@Param("userId") Long userId);

    Page<Review> findByCropIdOrderByCreatedAtDesc(Long cropId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.crop.id = :cropId")
    Double getAverageRatingForCrop(@Param("cropId") Long cropId);

    boolean existsByOrderIdAndReviewerId(Long orderId, Long reviewerId);
}
