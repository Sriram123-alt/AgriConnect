package com.agriconnect.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatPartnerDTO {
    private Long userId;
    private String fullName;
    private String role;
    private long unreadCount;
    private ChatMessageDTO lastMessage;
}
