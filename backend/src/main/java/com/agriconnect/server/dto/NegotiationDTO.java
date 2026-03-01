package com.agriconnect.server.dto;

import com.agriconnect.server.entity.Negotiation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NegotiationDTO {
    private Long id;
    private Long cropId;
    private String cropName;
    private Long buyerId;
    private String buyerName;
    private BigDecimal offeredPrice;
    private BigDecimal originalPrice;
    private Double quantity;
    private Negotiation.NegotiationStatus status;
    private String message;
    private BigDecimal counterPrice;
    private String farmerMessage;
    private LocalDateTime createdAt;
}
