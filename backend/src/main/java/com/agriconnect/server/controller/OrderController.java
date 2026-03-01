package com.agriconnect.server.controller;

import com.agriconnect.server.dto.ApiResponse;
import com.agriconnect.server.dto.OrderDTO;
import com.agriconnect.server.entity.Order;
import com.agriconnect.server.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<OrderDTO>> placeOrder(@RequestBody OrderDTO orderDTO,
            Authentication authentication) {
        OrderDTO result = orderService.placeOrder(orderDTO, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Order placed successfully!"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<OrderDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status,
            Authentication authentication) {
        OrderDTO result = orderService.updateOrderStatus(id, status, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Order status updated!"));
    }

    @PatchMapping("/{id}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Order.PaymentStatus farmerPayment,
            @RequestParam(required = false) Order.PaymentStatus transportPayment,
            Authentication authentication) {
        OrderDTO result = orderService.updatePaymentStatus(id, farmerPayment, transportPayment,
                authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Payment status updated!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id, Authentication authentication) {
        OrderDTO result = orderService.getOrderById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Order fetched successfully!"));
    }

    @GetMapping("/buyer/me")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDTO> result = orderService.getBuyerOrders(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Your orders fetched successfully!"));
    }

    @GetMapping("/farmer/me")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getFarmerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDTO> result = orderService.getFarmerOrders(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Farmer orders fetched successfully!"));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDTO> result = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "All orders fetched successfully!"));
    }
}
