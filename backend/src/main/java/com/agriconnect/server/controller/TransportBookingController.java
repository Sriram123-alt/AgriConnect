package com.agriconnect.server.controller;

import com.agriconnect.server.dto.ApiResponse;
import com.agriconnect.server.dto.TransportBookingDTO;
import com.agriconnect.server.entity.TransportBooking;
import com.agriconnect.server.service.TransportBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportBookingController {

    @Autowired
    private TransportBookingService transportBookingService;

    /**
     * Buyer books transport for a placed order.
     * POST /api/transport/book
     */
    @PostMapping("/book")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<TransportBookingDTO>> bookTransport(
            @RequestBody TransportBookingDTO.CreateRequest request,
            Authentication authentication) {
        TransportBookingDTO result = transportBookingService.createBooking(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Transport booked successfully!"));
    }

    /**
     * Get vehicle options recommended for a given weight.
     * GET /api/transport/vehicle-options?weightKg=500
     */
    @GetMapping("/vehicle-options")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<List<TransportBookingDTO.VehicleOption>>> getVehicleOptions(
            @RequestParam(required = false) Double weightKg) {
        List<TransportBookingDTO.VehicleOption> options = transportBookingService.getVehicleOptions(weightKg);
        return ResponseEntity.ok(ApiResponse.success(options, "Vehicle options fetched"));
    }

    /**
     * Get transport booking by order id.
     * GET /api/transport/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<TransportBookingDTO>> getByOrderId(
            @PathVariable Long orderId,
            Authentication authentication) {
        TransportBookingDTO result = transportBookingService.getBookingByOrderId(orderId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Transport booking fetched"));
    }

    /**
     * Get transport booking by booking id.
     * GET /api/transport/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransportBookingDTO>> getById(
            @PathVariable Long id,
            Authentication authentication) {
        TransportBookingDTO result = transportBookingService.getBookingById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Transport booking fetched"));
    }

    /**
     * Buyer — all my transport bookings.
     * GET /api/transport/buyer/me
     */
    @GetMapping("/buyer/me")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Page<TransportBookingDTO>>> getBuyerBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransportBookingDTO> result = transportBookingService.getBuyerBookings(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Your transport bookings fetched"));
    }

    /**
     * Farmer — transport bookings relevant to my crops.
     * GET /api/transport/farmer/me
     */
    @GetMapping("/farmer/me")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<Page<TransportBookingDTO>>> getFarmerBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransportBookingDTO> result = transportBookingService.getFarmerBookings(authentication.getName(),
                pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Farmer transport bookings fetched"));
    }

    /**
     * Admin — all transport bookings.
     * GET /api/transport/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRANSPORT')")
    public ResponseEntity<ApiResponse<Page<TransportBookingDTO>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransportBookingDTO> result = transportBookingService.getAllBookings(pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "All transport bookings fetched"));
    }

    /**
     * Update booking status (Farmer / Admin).
     * PATCH /api/transport/{id}/status?status=IN_TRANSIT
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRANSPORT')")
    public ResponseEntity<ApiResponse<TransportBookingDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam TransportBooking.BookingStatus status,
            Authentication authentication) {
        TransportBookingDTO result = transportBookingService.updateBookingStatus(id, status, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Booking status updated"));
    }

    /**
     * Update driver and vehicle details.
     * PATCH /api/transport/{id}/driver-details
     */
    @PatchMapping("/{id}/driver-details")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRANSPORT')")
    public ResponseEntity<ApiResponse<TransportBookingDTO>> updateDriverDetails(
            @PathVariable Long id,
            @RequestParam String driverName,
            @RequestParam String driverPhone,
            @RequestParam String vehicleNumber,
            @RequestParam String estimatedDeliveryDate) {
        TransportBookingDTO result = transportBookingService.updateDriverDetails(id, driverName, driverPhone,
                vehicleNumber, estimatedDeliveryDate);
        return ResponseEntity.ok(ApiResponse.success(result, "Driver details updated!"));
    }
}
