package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.TransportBookingDTO;
import com.agriconnect.server.entity.*;
import com.agriconnect.server.repository.*;
import com.agriconnect.server.service.NotificationService;
import com.agriconnect.server.service.TransportBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransportBookingServiceImpl implements TransportBookingService {

    @Autowired
    private TransportBookingRepository transportBookingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public TransportBookingDTO createBooking(TransportBookingDTO.CreateRequest request, String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail).orElseThrow(
                () -> new RuntimeException("Buyer not found"));

        Order order = orderRepository.findById(request.getOrderId()).orElseThrow(
                () -> new RuntimeException("Order not found with id: " + request.getOrderId()));

        // Verify the order belongs to this buyer
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Unauthorized: This order does not belong to you");
        }

        // Check if a booking already exists for this order
        if (transportBookingRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new RuntimeException("A transport booking already exists for this order");
        }

        // Calculate total weight from the order items
        double totalWeightKg = order.getItems().stream()
                .mapToDouble(item -> item.getQuantity())
                .sum();

        // Determine vehicle type (use requested or auto-recommend)
        TransportBooking.VehicleType vehicleType = request.getVehicleType() != null
                ? request.getVehicleType()
                : recommendVehicleType(totalWeightKg);

        // Calculate estimated cost: base cost per ton + distance flat fee (simulated)
        BigDecimal estimatedCost = calculateCost(vehicleType, totalWeightKg);

        // Pickup address: from crop / farmer, fallback to request
        String pickupAddress = resolvePickupAddress(order, request.getPickupAddress());
        String deliveryAddress = request.getDeliveryAddress() != null
                ? request.getDeliveryAddress()
                : order.getShippingAddress();

        TransportBooking booking = TransportBooking.builder()
                .order(order)
                .vehicleType(vehicleType)
                .pickupAddress(pickupAddress)
                .deliveryAddress(deliveryAddress)
                .totalWeightKg(totalWeightKg)
                .estimatedCost(estimatedCost)
                .status(TransportBooking.BookingStatus.BOOKED)
                .build();

        TransportBooking saved = transportBookingRepository.save(booking);

        // Update Order with transport fee
        order.setTransportFee(estimatedCost);
        orderRepository.save(order);

        // Notify Farmer
        notificationService.createNotification(
                order.getItems().get(0).getCrop().getFarmer(),
                "Transport Booked",
                "Transport has been booked for Order #" + order.getId() + ".",
                "TRANSPORT",
                "/orders/" + order.getId());

        return mapToDTO(saved);
    }

    @Override
    public TransportBookingDTO getBookingByOrderId(Long orderId, String email) {
        TransportBooking booking = transportBookingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No transport booking found for order: " + orderId));
        return mapToDTO(booking);
    }

    @Override
    public TransportBookingDTO getBookingById(Long id, String email) {
        TransportBooking booking = transportBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport booking not found: " + id));
        return mapToDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransportBookingDTO> getBuyerBookings(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email).orElseThrow();
        return transportBookingRepository.findByBuyer(buyer, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransportBookingDTO> getFarmerBookings(String email, Pageable pageable) {
        User farmer = userRepository.findByEmail(email).orElseThrow();
        return transportBookingRepository.findByFarmer(farmer, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransportBookingDTO> getAllBookings(Pageable pageable) {
        return transportBookingRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public TransportBookingDTO updateBookingStatus(Long id, TransportBooking.BookingStatus status, String email) {
        TransportBooking booking = transportBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport booking not found: " + id));
        booking.setStatus(status);

        // Sync with Order Status
        Order order = booking.getOrder();
        if (status == TransportBooking.BookingStatus.PICKED_UP) {
            order.setStatus(Order.OrderStatus.SHIPPED);
            orderRepository.save(order);
        } else if (status == TransportBooking.BookingStatus.DELIVERED) {
            order.setStatus(Order.OrderStatus.DELIVERED);
            orderRepository.save(order);
        }

        TransportBooking updated = transportBookingRepository.save(booking);

        // Notify Buyer and Farmer
        String title = "Transport Update: " + status;
        String message = "Transport for Order #" + updated.getOrder().getId() + " is now " + status + ".";
        notificationService.createNotification(updated.getOrder().getBuyer(), title, message, "TRANSPORT",
                "/orders/" + updated.getOrder().getId());
        notificationService.createNotification(updated.getOrder().getItems().get(0).getCrop().getFarmer(), title,
                message, "TRANSPORT", "/orders/" + updated.getOrder().getId());

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public TransportBookingDTO updateDriverDetails(Long id, String driverName, String driverPhone, String vehicleNumber,
            String estimatedDeliveryDate) {
        TransportBooking booking = transportBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport booking not found: " + id));
        booking.setDriverName(driverName);
        booking.setDriverPhone(driverPhone);
        booking.setVehicleNumber(vehicleNumber);
        booking.setEstimatedDeliveryDate(estimatedDeliveryDate);
        booking.setStatus(TransportBooking.BookingStatus.DRIVER_ASSIGNED);
        TransportBooking updated = transportBookingRepository.save(booking);

        // Notify Buyer and Farmer
        String title = "Driver Assigned";
        String message = "A driver (" + driverName + ") has been assigned to transport your order #"
                + updated.getOrder().getId() + ".";
        notificationService.createNotification(updated.getOrder().getBuyer(), title, message, "TRANSPORT",
                "/orders/" + updated.getOrder().getId());
        notificationService.createNotification(updated.getOrder().getItems().get(0).getCrop().getFarmer(), title,
                message, "TRANSPORT", "/orders/" + updated.getOrder().getId());

        return mapToDTO(updated);
    }

    @Override
    public List<TransportBookingDTO.VehicleOption> getVehicleOptions(Double totalWeightKg) {
        TransportBooking.VehicleType recommended = recommendVehicleType(totalWeightKg != null ? totalWeightKg : 0);
        return Arrays.stream(TransportBooking.VehicleType.values())
                .map(vt -> TransportBookingDTO.VehicleOption.builder()
                        .type(vt.name())
                        .label(vt.getLabel())
                        .maxWeightKg(vt.getMaxWeightKg() == Double.MAX_VALUE ? 999999 : vt.getMaxWeightKg())
                        .baseCostPerTon(vt.getBaseCostPerTon())
                        .recommended(vt == recommended ? "YES" : "NO")
                        .build())
                .collect(Collectors.toList());
    }

    // ── Private helpers ────────────────────────────────────────────────

    private TransportBooking.VehicleType recommendVehicleType(double weightKg) {
        if (weightKg <= 1000)
            return TransportBooking.VehicleType.MINI_TRUCK;
        if (weightKg <= 5000)
            return TransportBooking.VehicleType.MEDIUM_LORRY;
        if (weightKg <= 15000)
            return TransportBooking.VehicleType.LARGE_LORRY;
        return TransportBooking.VehicleType.HEAVY_TRUCK;
    }

    private BigDecimal calculateCost(TransportBooking.VehicleType vehicleType, double weightKg) {
        double tons = Math.max(weightKg / 1000.0, 0.5); // minimum 0.5 ton billing
        double cost = vehicleType.getBaseCostPerTon() * tons;
        // Add a flat base charge per booking
        cost += 250;
        return BigDecimal.valueOf(cost).setScale(2, RoundingMode.HALF_UP);
    }

    private String resolvePickupAddress(Order order, String requestPickup) {
        if (requestPickup != null && !requestPickup.isBlank())
            return requestPickup;
        // Try to get farmer location from the first crop in order
        if (!order.getItems().isEmpty()) {
            Crop firstCrop = order.getItems().get(0).getCrop();
            if (firstCrop.getLocation() != null && !firstCrop.getLocation().isBlank()) {
                return firstCrop.getLocation();
            }
            // Fallback to farmer's registered address
            User farmer = firstCrop.getFarmer();
            if (farmer.getAddress() != null && !farmer.getAddress().isBlank()) {
                return farmer.getAddress();
            }
        }
        return "Farmer's location (contact farmer for exact address)";
    }

    private TransportBookingDTO mapToDTO(TransportBooking booking) {
        return TransportBookingDTO.builder()
                .id(booking.getId())
                .orderId(booking.getOrder().getId())
                .buyerName(booking.getOrder().getBuyer().getFullName())
                .vehicleType(booking.getVehicleType())
                .vehicleTypeLabel(booking.getVehicleType().getLabel())
                .pickupAddress(booking.getPickupAddress())
                .deliveryAddress(booking.getDeliveryAddress())
                .totalWeightKg(booking.getTotalWeightKg())
                .estimatedCost(booking.getEstimatedCost())
                .status(booking.getStatus())
                .driverName(booking.getDriverName())
                .driverPhone(booking.getDriverPhone())
                .vehicleNumber(booking.getVehicleNumber())
                .estimatedDeliveryDate(booking.getEstimatedDeliveryDate())
                .orderStatus(booking.getOrder() != null && booking.getOrder().getStatus() != null
                        ? booking.getOrder().getStatus().name()
                        : null)
                .createdAt(booking.getCreatedAt())
                .paymentStatus(booking.getOrder() != null && booking.getOrder().getPaymentStatus() != null
                        ? booking.getOrder().getPaymentStatus().name()
                        : null)
                .transportPaymentStatus(
                        booking.getOrder() != null && booking.getOrder().getTransportPaymentStatus() != null
                                ? booking.getOrder().getTransportPaymentStatus().name()
                                : null)
                .paymentMethod(booking.getOrder() != null && booking.getOrder().getPaymentMethod() != null
                        ? booking.getOrder().getPaymentMethod().name()
                        : null)
                .build();
    }
}
