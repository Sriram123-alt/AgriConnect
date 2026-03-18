package com.agriconnect.server.repository;

import com.agriconnect.server.entity.ChatMessage;
import com.agriconnect.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
            "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
            "(m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
            "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    @Query("SELECT m FROM ChatMessage m WHERE " +
            "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
            "(m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
            "AND m.order.id = :orderId " +
            "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversationByOrder(@Param("userId") Long userId,
                                              @Param("otherUserId") Long otherUserId,
                                              @Param("orderId") Long orderId);

    @Query("SELECT u FROM User u WHERE u.id IN (" +
            "SELECT m.receiver.id FROM ChatMessage m WHERE m.sender.id = :userId) " +
            "OR u.id IN (SELECT m.sender.id FROM ChatMessage m WHERE m.receiver.id = :userId)")
    List<User> findChatPartners(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM chat_messages m WHERE " +
            "((m.sender_id = :userId AND m.receiver_id = :otherUserId) OR " +
            "(m.sender_id = :otherUserId AND m.receiver_id = :userId)) " +
            "ORDER BY m.created_at DESC LIMIT 1", nativeQuery = true)
    ChatMessage findLastMessage(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    long countBySenderIdAndReceiverIdAndIsReadFalse(Long senderId, Long receiverId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadForUser(@Param("userId") Long userId);

    List<ChatMessage> findBySenderIdAndReceiverIdAndIsReadFalse(Long senderId, Long receiverId);
}
