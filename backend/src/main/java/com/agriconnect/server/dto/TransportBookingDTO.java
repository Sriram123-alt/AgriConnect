package com.agriconnect.server.dto;

import com.agriconnect.server.entity.TransportBooking;
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
public class TransportBookingDTO {
    private Long id;
    private Long orderId;
    private String buyerName;
    private TransportBooking.VehicleType vehicleType;
    private String vehicleTypeLabel;
    private String pickupAddress;
    private String deliveryAddress;
    private Double totalWeightKg;
    private BigDecimal estimatedCost;
    private TransportBooking.BookingStatus status;
    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private String estimatedDeliveryDate;
    private String orderStatus;
    private LocalDateTime createdAt;
    private String paymentStatus;
    private String transportPaymentStatus;
    private String paymentMethod;

    // For creating a booking (request body)
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CreateRequest {
        private Long orderId;
        private TransportBooking.VehicleType vehicleType;
        private String pickupAddress; // farmer location (auto-filled ideally)
        private String deliveryAddress; // buyer location
    }

    // Vehicle option for frontend dropdown
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class VehicleOption {
        private String type;
        private String label;
        private double maxWeightKg;
        private double baseCostPerTon;
        private String recommended;
    }
}
