package com.agriconnect.server.repository;

import com.agriconnect.server.entity.Order;
import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByBuyerOrderByIdDesc(User buyer, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.crop.farmer = :farmer ORDER BY o.id DESC")
    Page<Order> findByFarmerOrderByIdDesc(@Param("farmer") User farmer, Pageable pageable);

    Page<Order> findAllByOrderByIdDesc(Pageable pageable);
}
