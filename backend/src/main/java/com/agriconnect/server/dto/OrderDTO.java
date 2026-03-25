package com.agriconnect.server.dto;

import com.agriconnect.server.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String shippingAddress;
    private String paymentTransactionId;
    private Order.PaymentStatus paymentStatus;
    private Order.PaymentStatus farmerPaymentStatus;
    private Order.PaymentStatus transportPaymentStatus;
    private Order.PaymentMethod paymentMethod;
    private List<OrderItemDTO> items;
    private Boolean hasTransport;
    private Long transportId;
    private String transportStatus;
    private Double totalWeightKg;
    private BigDecimal transportFee;
    private BigDecimal farmerEarnings; // Net amount for the farmer after platform fee
    private LocalDateTime createdAt;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private Long id;
        private Long cropId;
        private Long negotiationId;
        private String cropName;
        private Long farmerId;
        private String farmerName;
        private String farmerLocation;
        private BigDecimal priceAtPurchase;
        private Double quantity;
    }
}
