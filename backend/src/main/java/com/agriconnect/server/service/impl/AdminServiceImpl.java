package com.agriconnect.server.service.impl;

import com.agriconnect.server.entity.User;
import com.agriconnect.server.repository.CropRepository;
import com.agriconnect.server.repository.OrderRepository;
import com.agriconnect.server.repository.UserRepository;
import com.agriconnect.server.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Page<User> getPendingFarmers(Pageable pageable) {
        return userRepository.findByRoleAndIsApproved(com.agriconnect.server.entity.RoleType.ROLE_FARMER, false,
                pageable);
    }

    @Override
    @Transactional
    public void approveFarmer(Long farmerId) {
        User farmer = userRepository.findById(farmerId).orElseThrow();
        farmer.setApproved(true);
        userRepository.save(farmer);
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCrops", cropRepository.count());
        stats.put("totalOrders", orderRepository.count());

        java.math.BigDecimal revenue = orderRepository.findAll().stream()
                .map(order -> order.getTotalAmount() != null ? order.getTotalAmount() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        stats.put("totalRevenue", revenue);
        stats.put("totalCommission", revenue.multiply(new java.math.BigDecimal("0.05")));
        return stats;
    }

    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public User toggleUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setActive(active);
        return userRepository.save(user);
    }
}
