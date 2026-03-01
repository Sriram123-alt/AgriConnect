package com.agriconnect.server.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "transport_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TransportBooking extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.MINI_TRUCK;

    @Column(nullable = false)
    private String pickupAddress; // Farmer location

    @Column(nullable = false)
    private String deliveryAddress; // Buyer location

    @Column(nullable = false)
    private Double totalWeightKg;

    @Column(nullable = false)
    private BigDecimal estimatedCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.BOOKED;

    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private String estimatedDeliveryDate;

    public enum VehicleType {
        MINI_TRUCK("Mini Truck (up to 1 Ton)", 1000.0, 500.0),
        MEDIUM_LORRY("Medium Lorry (1-5 Tons)", 5000.0, 800.0),
        LARGE_LORRY("Large Lorry (5-15 Tons)", 15000.0, 1200.0),
        HEAVY_TRUCK("Heavy Truck (15+ Tons)", Double.MAX_VALUE, 2000.0);

        private final String label;
        private final double maxWeightKg;
        private final double baseCostPerTon;

        VehicleType(String label, double maxWeightKg, double baseCostPerTon) {
            this.label = label;
            this.maxWeightKg = maxWeightKg;
            this.baseCostPerTon = baseCostPerTon;
        }

        public String getLabel() {
            return label;
        }

        public double getMaxWeightKg() {
            return maxWeightKg;
        }

        public double getBaseCostPerTon() {
            return baseCostPerTon;
        }
    }

    public enum BookingStatus {
        BOOKED,
        DRIVER_ASSIGNED,
        PICKED_UP,
        IN_TRANSIT,
        DELIVERED,
        CANCELLED
    }
}
