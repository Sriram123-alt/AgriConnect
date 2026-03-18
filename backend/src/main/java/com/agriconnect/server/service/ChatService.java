package com.agriconnect.server.service;

import com.agriconnect.server.dto.ChatMessageDTO;
import com.agriconnect.server.dto.ChatPartnerDTO;

import java.util.List;

public interface ChatService {
    ChatMessageDTO sendMessage(ChatMessageDTO messageDTO, String email);
    List<ChatMessageDTO> getConversation(Long otherUserId, Long orderId, String email);
    List<ChatPartnerDTO> getChatPartners(String email);
    void markConversationAsRead(Long otherUserId, String email);
    long getUnreadCount(String email);
}
