package com.agriconnect.server.service;

import com.agriconnect.server.dto.OrderDTO;
import com.agriconnect.server.dto.UnifiedCheckoutRequest;
import com.agriconnect.server.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDTO placeOrder(OrderDTO orderDTO, String email);

    OrderDTO processUnifiedCheckout(UnifiedCheckoutRequest request, String email);

    OrderDTO updateOrderStatus(Long id, Order.OrderStatus status, String email);

    OrderDTO updatePaymentStatus(Long id, Order.PaymentStatus paymentStatus, Order.PaymentStatus farmerPayment,
            Order.PaymentStatus transportPayment,
            String email);

    OrderDTO getOrderById(Long id, String email);

    Page<OrderDTO> getBuyerOrders(String email, Pageable pageable);

    Page<OrderDTO> getFarmerOrders(String email, Pageable pageable);

    Page<OrderDTO> getAllOrders(Pageable pageable); // For Admin

    OrderDTO processUnifiedPayment(Long orderId, String transactionId, Order.PaymentMethod method, String email);
}
