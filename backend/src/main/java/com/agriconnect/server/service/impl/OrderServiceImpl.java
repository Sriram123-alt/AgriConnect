package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.OrderDTO;
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
                .status(orderDTO.getPaymentMethod() == Order.PaymentMethod.COD ? Order.OrderStatus.PENDING
                        : Order.OrderStatus.PAID)
                .paymentStatus(orderDTO.getPaymentMethod() == Order.PaymentMethod.COD ? Order.PaymentStatus.PENDING
                        : Order.PaymentStatus.PAID)
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
    public Page<OrderDTO> getBuyerOrders(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByBuyer(buyer, pageable).map(this::mapToDTO);
    }

    @Override
    public Page<OrderDTO> getFarmerOrders(String email, Pageable pageable) {
        User farmer = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByFarmer(farmer, pageable).map(this::mapToDTO);
    }

    @Override
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToDTO);
    }

    private OrderDTO mapToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .buyerId(order.getBuyer().getId())
                .buyerName(order.getBuyer().getFullName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentTransactionId(order.getPaymentTransactionId())
                .paymentStatus(order.getPaymentStatus())
                .farmerPaymentStatus(order.getFarmerPaymentStatus())
                .transportPaymentStatus(order.getTransportPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .totalWeightKg(order.getItems().stream().mapToDouble(i -> i.getQuantity()).sum())
                .items(order.getItems().stream().map(item -> OrderDTO.OrderItemDTO.builder()
                        .id(item.getId())
                        .cropId(item.getCrop().getId())
                        .cropName(item.getCrop().getName())
                        .farmerName(item.getCrop().getFarmer().getFullName())
                        .farmerLocation(item.getCrop().getLocation() != null ? item.getCrop().getLocation()
                                : item.getCrop().getFarmer().getAddress())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .quantity(item.getQuantity())
                        .build()).collect(Collectors.toList()))
                .hasTransport(transportBookingRepository.findByOrderId(order.getId())
                        .map(t -> t.getStatus() != TransportBooking.BookingStatus.CANCELLED)
                        .orElse(false))
                .transportId(transportBookingRepository.findByOrderId(order.getId())
                        .map(t -> t.getId())
                        .orElse(null))
                .transportStatus(transportBookingRepository.findByOrderId(order.getId())
                        .map(t -> t.getStatus().name())
                        .orElse(null))
                .build();
    }
}
