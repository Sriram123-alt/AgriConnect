package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.OrderDTO;
import com.agriconnect.server.dto.UnifiedCheckoutRequest;
import com.agriconnect.server.entity.*;
import com.agriconnect.server.repository.*;
import com.agriconnect.server.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private CommissionRecordRepository commissionRepository;

    @Autowired
    private NegotiationRepository negotiationRepository;

    @Autowired
    private com.agriconnect.server.service.NotificationService notificationService;

    @Autowired
    private TransportBookingRepository transportBookingRepository;

    private static final double COMMISSION_PERCENTAGE = 5.0;

    @Override
    @Transactional
    public OrderDTO placeOrder(OrderDTO orderDTO, String email) {
        User buyer = userRepository.findByEmail(email).orElseThrow();

        Order order = Order.builder()
                .buyer(buyer)
                .shippingAddress(orderDTO.getShippingAddress())
                .paymentMethod(orderDTO.getPaymentMethod())
                .paymentTransactionId(orderDTO.getPaymentTransactionId())
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .transportFee(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderDTO.OrderItemDTO itemDTO : orderDTO.getItems()) {
            Crop crop = cropRepository.findById(itemDTO.getCropId()).orElseThrow();
            BigDecimal price = crop.getPricePerKg();

            // Check if there's a negotiation
            if (itemDTO.getNegotiationId() != null) {
                Negotiation neg = negotiationRepository.findById(itemDTO.getNegotiationId()).orElseThrow();
                if (neg.getStatus() == Negotiation.NegotiationStatus.ACCEPTED &&
                        neg.getBuyer().getId().equals(buyer.getId()) &&
                        neg.getCrop().getId().equals(crop.getId())) {
                    price = neg.getOfferedPrice();
                }
            }

            // Check quantity availability
            if (crop.getQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Insufficient quantity for " + crop.getName());
            }

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .crop(crop)
                    .priceAtPurchase(price)
                    .quantity(itemDTO.getQuantity())
                    .build();

            order.getItems().add(item);
            total = total.add(price.multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

            // Deduct quantity
            crop.setQuantity(crop.getQuantity() - itemDTO.getQuantity());
            cropRepository.save(crop);
        }

        order.setTotalAmount(total);
        if (order.getPaymentTransactionId() == null) {
            order.setPaymentTransactionId("SIMULATED_" + System.currentTimeMillis());
        }

        Order savedOrder = orderRepository.save(order);

        // Calculate and save commission
        BigDecimal commissionAmount = total.multiply(BigDecimal.valueOf(COMMISSION_PERCENTAGE / 100));
        CommissionRecord commission = CommissionRecord.builder()
                .order(savedOrder)
                .percentage(COMMISSION_PERCENTAGE)
                .commissionAmount(commissionAmount)
                .build();
        commissionRepository.save(commission);

        // Notify farmers
        savedOrder.getItems().stream()
                .map(item -> item.getCrop().getFarmer())
                .distinct()
                .forEach(farmer -> notificationService.createNotification(
                        farmer,
                        "New Order Received",
                        String.format("You have a new order (#%d) for your crops.", savedOrder.getId()),
                        "ORDER",
                        "/manage-orders"));

        return mapToDTO(savedOrder);
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus status, String email) {
        Order order = orderRepository.findById(id).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();

        // Security check: Only Admin or the Farmer who owns the crops in the order can
        // update
        if (!user.getRole().equals(RoleType.ROLE_ADMIN)) {
            boolean isOwner = order.getItems().stream()
                    .anyMatch(item -> item.getCrop().getFarmer().getEmail().equals(email));
            if (!isOwner)
                throw new RuntimeException("Unauthorized: You do not own any items in this order");
        }

        // Business Logic: If transport is active, Farmer cannot manually set SHIPPED or
        // DELIVERED
        transportBookingRepository.findByOrderId(id).ifPresent(transport -> {
            if (transport.getStatus() != TransportBooking.BookingStatus.CANCELLED) {
                if (status == Order.OrderStatus.SHIPPED || status == Order.OrderStatus.DELIVERED) {
                    if (!user.getRole().equals(RoleType.ROLE_ADMIN)) {
                        throw new RuntimeException(
                                "This order is handled by a transport partner. Status will update automatically.");
                    }
                }
            }
        });

        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer(),
                "Order Status Updated",
                String.format("Your order #%d status has been updated to %s.", order.getId(), status),
                "ORDER",
                "/orders");

        return mapToDTO(savedOrder);
    }

    @Override
    @Transactional
    public OrderDTO updatePaymentStatus(Long id, Order.PaymentStatus paymentStatus,
            Order.PaymentStatus farmerPayment, Order.PaymentStatus transportPayment, String email) {
        Order order = orderRepository.findById(id).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (!user.getRole().equals(RoleType.ROLE_ADMIN)) {
            throw new RuntimeException("Unauthorized");
        }

        if (paymentStatus != null) {
            order.setPaymentStatus(paymentStatus);
            // Notify buyer about their payment status update
            notificationService.createNotification(
                    order.getBuyer(),
                    "Payment Status Updated",
                    String.format("The payment status for your order #%d has been updated to %s.", order.getId(),
                            paymentStatus),
                    "ORDER",
                    "/orders");
        }
        if (farmerPayment != null) {
            order.setFarmerPaymentStatus(farmerPayment);
        }
        if (transportPayment != null) {
            order.setTransportPaymentStatus(transportPayment);
        }

        Order savedOrder = orderRepository.save(order);
        return mapToDTO(savedOrder);
    }

    @Override
    public OrderDTO getOrderById(Long id, String email) {
        Order order = orderRepository.findById(id).orElseThrow();
        return mapToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getBuyerOrders(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByBuyerOrderByIdDesc(buyer, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getFarmerOrders(String email, Pageable pageable) {
        User farmer = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByFarmerOrderByIdDesc(farmer, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByIdDesc(pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public OrderDTO processUnifiedPayment(Long orderId, String transactionId, Order.PaymentMethod method, String email) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setFarmerPaymentStatus(Order.PaymentStatus.PENDING); 
        order.setTransportPaymentStatus(Order.PaymentStatus.PENDING);
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentTransactionId(transactionId);
        order.setPaymentMethod(method);

        Order saved = orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer(),
                "Payment Successful",
                String.format("Unified payment for Order #%d (Crops + Transport) was successful.", order.getId()),
                "ORDER",
                "/orders");

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public OrderDTO processUnifiedCheckout(UnifiedCheckoutRequest request, String email) {
        // 1. Place the order
        OrderDTO orderDTO = placeOrder(request.getOrderDetails(), email);
        Order order = orderRepository.findById(orderDTO.getId()).orElseThrow();

        // 2. Create the transport booking
        double totalWeightKg = order.getItems().stream().mapToDouble(i -> i.getQuantity()).sum();
        BigDecimal estimatedCost = calculateTransportCost(request.getVehicleType(), totalWeightKg);

        TransportBooking booking = TransportBooking.builder()
                .order(order)
                .vehicleType(request.getVehicleType())
                .pickupAddress(resolvePickupAddress(order))
                .deliveryAddress(order.getShippingAddress())
                .totalWeightKg(totalWeightKg)
                .estimatedCost(estimatedCost)
                .status(TransportBooking.BookingStatus.BOOKED)
                .build();

        transportBookingRepository.save(booking);

        // 3. Complete payment status: platform received money from buyer
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setFarmerPaymentStatus(Order.PaymentStatus.PENDING); // Admin will pay them
        order.setTransportPaymentStatus(Order.PaymentStatus.PENDING); // Admin will pay them
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentTransactionId(request.getTransactionId());
        order.setTransportFee(estimatedCost);
        order.setPaymentMethod(Order.PaymentMethod.UPI); // Default for unified

        Order saved = orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer(),
                "Order & Transport Confirmed",
                String.format("Payment successful for Order #%d. Total weight: %.1f kg.", order.getId(), totalWeightKg),
                "ORDER",
                "/orders/" + order.getId());

        return mapToDTO(saved);
    }

    private BigDecimal calculateTransportCost(TransportBooking.VehicleType vehicleType, double weightKg) {
        double tons = Math.max(weightKg / 1000.0, 0.5);
        double cost = vehicleType.getBaseCostPerTon() * tons;
        cost += 250; // flat fee
        return BigDecimal.valueOf(cost).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private String resolvePickupAddress(Order order) {
        if (!order.getItems().isEmpty()) {
            Crop firstCrop = order.getItems().get(0).getCrop();
            if (firstCrop.getLocation() != null && !firstCrop.getLocation().isBlank()) {
                return firstCrop.getLocation();
            }
            User farmer = firstCrop.getFarmer();
            if (farmer.getAddress() != null && !farmer.getAddress().isBlank()) {
                return farmer.getAddress();
            }
        }
        return "Farmer's location";
    }

    private OrderDTO mapToDTO(Order order) {
        BigDecimal subtotal = order.getItems().stream()
                .map(item -> item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal earnings = subtotal.multiply(BigDecimal.valueOf(1 - COMMISSION_PERCENTAGE / 100));

        // Fetch transport info once to avoid multiple DB hits
        TransportBooking transport = transportBookingRepository.findByOrderId(order.getId()).orElse(null);

        return OrderDTO.builder()
                .id(order.getId())
                .buyerId(order.getBuyer().getId())
                .buyerName(order.getBuyer().getFullName())
                .totalAmount(order.getTotalAmount())
                .farmerEarnings(earnings.setScale(2, java.math.RoundingMode.HALF_UP))
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentTransactionId(order.getPaymentTransactionId())
                .paymentStatus(order.getPaymentStatus())
                .farmerPaymentStatus(order.getFarmerPaymentStatus())
                .transportPaymentStatus(order.getTransportPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .transportFee(order.getTransportFee() != null ? order.getTransportFee() : BigDecimal.ZERO)
                .totalWeightKg(order.getItems().stream().mapToDouble(i -> i.getQuantity()).sum())
                .items(order.getItems().stream().map(item -> OrderDTO.OrderItemDTO.builder()
                        .id(item.getId())
                        .cropId(item.getCrop().getId())
                        .cropName(item.getCrop().getName())
                        .farmerId(item.getCrop().getFarmer().getId())
                        .farmerName(item.getCrop().getFarmer().getFullName())
                        .farmerLocation(item.getCrop().getLocation() != null ? item.getCrop().getLocation()
                                : item.getCrop().getFarmer().getAddress())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .quantity(item.getQuantity())
                        .build()).collect(Collectors.toList()))
                .hasTransport(transport != null && transport.getStatus() != TransportBooking.BookingStatus.CANCELLED)
                .transportId(transport != null ? transport.getId() : null)
                .transportStatus(transport != null ? transport.getStatus().name() : null)
                .build();
    }
}
