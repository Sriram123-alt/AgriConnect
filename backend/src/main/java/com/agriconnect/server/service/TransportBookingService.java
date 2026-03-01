package com.agriconnect.server.service;

import com.agriconnect.server.dto.TransportBookingDTO;
import com.agriconnect.server.entity.TransportBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TransportBookingService {

    TransportBookingDTO createBooking(TransportBookingDTO.CreateRequest request, String buyerEmail);

    TransportBookingDTO getBookingByOrderId(Long orderId, String email);

    TransportBookingDTO getBookingById(Long id, String email);

    Page<TransportBookingDTO> getBuyerBookings(String email, Pageable pageable);

    Page<TransportBookingDTO> getFarmerBookings(String email, Pageable pageable);

    Page<TransportBookingDTO> getAllBookings(Pageable pageable);

    TransportBookingDTO updateBookingStatus(Long id, TransportBooking.BookingStatus status, String email);

    TransportBookingDTO updateDriverDetails(Long id, String driverName, String driverPhone, String vehicleNumber,
            String estimatedDeliveryDate);

    List<TransportBookingDTO.VehicleOption> getVehicleOptions(Double totalWeightKg);
}
