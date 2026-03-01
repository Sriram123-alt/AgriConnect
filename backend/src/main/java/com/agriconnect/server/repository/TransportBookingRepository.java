package com.agriconnect.server.repository;

import com.agriconnect.server.entity.TransportBooking;
import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransportBookingRepository extends JpaRepository<TransportBooking, Long> {

    Optional<TransportBooking> findByOrderId(Long orderId);

    @Query("SELECT tb FROM TransportBooking tb WHERE tb.order.buyer = :buyer")
    Page<TransportBooking> findByBuyer(@Param("buyer") User buyer, Pageable pageable);

    @Query("SELECT tb FROM TransportBooking tb JOIN tb.order o JOIN o.items i WHERE i.crop.farmer = :farmer")
    Page<TransportBooking> findByFarmer(@Param("farmer") User farmer, Pageable pageable);
}
