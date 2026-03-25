package com.agriconnect.server.dto;

import com.agriconnect.server.entity.TransportBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnifiedCheckoutRequest {
    private OrderDTO orderDetails;
    private TransportBooking.VehicleType vehicleType;
    private String transactionId;
}
