package com.agriconnect.server.service;

import com.agriconnect.server.dto.NotificationDTO;
import com.agriconnect.server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Page<NotificationDTO> getMyNotifications(String email, Pageable pageable);

    void markAsRead(Long id, String email);

    void markAllAsRead(String email);

    long getUnreadCount(String email);

    void createNotification(User user, String title, String message, String type, String link);
}
