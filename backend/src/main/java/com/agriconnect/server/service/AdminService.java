package com.agriconnect.server.service;

import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AdminService {
    Page<User> getPendingFarmers(Pageable pageable);

    void approveFarmer(Long farmerId);

    Map<String, Object> getDashboardStats();

    Page<User> getAllUsers(Pageable pageable);

    User toggleUserStatus(Long userId, boolean active);
}
