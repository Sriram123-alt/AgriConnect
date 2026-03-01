package com.agriconnect.server.repository;

import com.agriconnect.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    org.springframework.data.domain.Page<User> findByRoleAndIsApproved(com.agriconnect.server.entity.RoleType role,
            boolean isApproved, org.springframework.data.domain.Pageable pageable);
}
