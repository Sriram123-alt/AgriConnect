package com.agriconnect.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "negotiations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Negotiation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(nullable = false)
    private BigDecimal offeredPrice;

    @Column(nullable = false)
    private Double quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NegotiationStatus status = NegotiationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message;

    private BigDecimal counterPrice;

    @Column(columnDefinition = "TEXT")
    private String farmerMessage;

    public enum NegotiationStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        COUNTERED
    }
}
