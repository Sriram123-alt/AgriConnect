package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.ChatMessageDTO;
import com.agriconnect.server.dto.ChatPartnerDTO;
import com.agriconnect.server.entity.ChatMessage;
import com.agriconnect.server.entity.Order;
import com.agriconnect.server.entity.User;
import com.agriconnect.server.repository.ChatMessageRepository;
import com.agriconnect.server.repository.OrderRepository;
import com.agriconnect.server.repository.UserRepository;
import com.agriconnect.server.service.ChatService;
import com.agriconnect.server.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public ChatMessageDTO sendMessage(ChatMessageDTO messageDTO, String email) {
        User sender = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(messageDTO.getReceiverId()).orElseThrow(
                () -> new RuntimeException("Receiver not found"));

        Order order = null;
        if (messageDTO.getOrderId() != null) {
            order = orderRepository.findById(messageDTO.getOrderId()).orElse(null);
        }

        ChatMessage msg = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .order(order)
                .content(messageDTO.getContent())
                .build();

        ChatMessage saved = chatMessageRepository.save(msg);

        // Notify receiver
        notificationService.createNotification(
                receiver,
                "New Message from " + sender.getFullName(),
                messageDTO.getContent().length() > 100
                        ? messageDTO.getContent().substring(0, 100) + "..."
                        : messageDTO.getContent(),
                "CHAT",
                "/messages");

        return mapToDTO(saved);
    }

    @Override
    public List<ChatMessageDTO> getConversation(Long otherUserId, Long orderId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));

        List<ChatMessage> messages;
        if (orderId != null) {
            messages = chatMessageRepository.findConversationByOrder(user.getId(), otherUserId, orderId);
        } else {
            messages = chatMessageRepository.findConversation(user.getId(), otherUserId);
        }

        return messages.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ChatPartnerDTO> getChatPartners(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));

        List<User> partners = chatMessageRepository.findChatPartners(user.getId());

        return partners.stream().map(partner -> {
            ChatMessage lastMsg = chatMessageRepository.findLastMessage(user.getId(), partner.getId());
            long unread = chatMessageRepository.countBySenderIdAndReceiverIdAndIsReadFalse(
                    partner.getId(), user.getId());

            return ChatPartnerDTO.builder()
                    .userId(partner.getId())
                    .fullName(partner.getFullName())
                    .role(partner.getRole().name())
                    .unreadCount(unread)
                    .lastMessage(lastMsg != null ? mapToDTO(lastMsg) : null)
                    .build();
        }).sorted(Comparator.comparing(
                (ChatPartnerDTO p) -> p.getLastMessage() != null ? p.getLastMessage().getCreatedAt() : null,
                Comparator.nullsLast(Comparator.reverseOrder())
        )).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markConversationAsRead(Long otherUserId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));
        List<ChatMessage> unread = chatMessageRepository.findBySenderIdAndReceiverIdAndIsReadFalse(
                otherUserId, user.getId());
        unread.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(unread);
    }

    @Override
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("User not found"));
        return chatMessageRepository.countUnreadForUser(user.getId());
    }

    private ChatMessageDTO mapToDTO(ChatMessage msg) {
        return ChatMessageDTO.builder()
                .id(msg.getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getFullName())
                .receiverId(msg.getReceiver().getId())
                .receiverName(msg.getReceiver().getFullName())
                .orderId(msg.getOrder() != null ? msg.getOrder().getId() : null)
                .content(msg.getContent())
                .isRead(msg.isRead())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
