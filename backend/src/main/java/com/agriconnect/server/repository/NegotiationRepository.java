package com.agriconnect.server.repository;

import com.agriconnect.server.entity.Negotiation;
import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NegotiationRepository extends JpaRepository<Negotiation, Long> {
    Page<Negotiation> findByBuyer(User buyer, Pageable pageable);

    // Custom query to find negotiations for crops owned by a specific farmer
    Page<Negotiation> findByCropFarmer(User farmer, Pageable pageable);
}
