package com.agriconnect.server.controller;

import com.agriconnect.server.dto.ApiResponse;
import com.agriconnect.server.dto.ChatMessageDTO;
import com.agriconnect.server.dto.ChatPartnerDTO;
import com.agriconnect.server.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendMessage(
            @RequestBody ChatMessageDTO messageDTO,
            Authentication authentication) {
        ChatMessageDTO result = chatService.sendMessage(messageDTO, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Message sent!"));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getConversation(
            @PathVariable Long otherUserId,
            @RequestParam(required = false) Long orderId,
            Authentication authentication) {
        List<ChatMessageDTO> result = chatService.getConversation(otherUserId, orderId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Conversation fetched!"));
    }

    @GetMapping("/partners")
    public ResponseEntity<ApiResponse<List<ChatPartnerDTO>>> getChatPartners(Authentication authentication) {
        List<ChatPartnerDTO> result = chatService.getChatPartners(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Chat partners fetched!"));
    }

    @PostMapping("/read/{otherUserId}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long otherUserId,
            Authentication authentication) {
        chatService.markConversationAsRead(otherUserId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as read!"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        long count = chatService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count fetched!"));
    }
}
