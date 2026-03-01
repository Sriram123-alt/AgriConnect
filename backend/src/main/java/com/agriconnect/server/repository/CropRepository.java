package com.agriconnect.server.repository;

import com.agriconnect.server.entity.Crop;
import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface CropRepository extends JpaRepository<Crop, Long> {
        Page<Crop> findByFarmer(User farmer, Pageable pageable);

        @Query("SELECT c FROM Crop c WHERE c.isActive = true " +
                        "AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', cast(:name as text), '%'))) " +
                        "AND (:organic IS NULL OR c.organic = :organic) " +
                        "AND (:minPrice IS NULL OR c.pricePerKg >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR c.pricePerKg <= :maxPrice)")
        Page<Crop> searchCrops(@Param("name") String name,
                        @Param("organic") Boolean organic,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice,
                        Pageable pageable);
}
