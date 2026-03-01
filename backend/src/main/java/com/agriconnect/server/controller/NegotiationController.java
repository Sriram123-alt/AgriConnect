package com.agriconnect.server.controller;

import com.agriconnect.server.dto.ApiResponse;
import com.agriconnect.server.dto.NegotiationDTO;
import com.agriconnect.server.entity.Negotiation;
import com.agriconnect.server.service.NegotiationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negotiations")
public class NegotiationController {

    @Autowired
    private NegotiationService negotiationService;

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<NegotiationDTO>> createOffer(@RequestBody NegotiationDTO negotiationDTO,
            Authentication authentication) {
        NegotiationDTO result = negotiationService.createOffer(negotiationDTO, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Offer sent successfully!"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<NegotiationDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam Negotiation.NegotiationStatus status,
            Authentication authentication) {
        NegotiationDTO result = negotiationService.updateStatus(id, status, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Negotiation status updated!"));
    }

    @GetMapping("/buyer/me")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Page<NegotiationDTO>>> getMyOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NegotiationDTO> result = negotiationService.getBuyerNegotiations(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Your offers fetched successfully!"));
    }

    @GetMapping("/farmer/me")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<Page<NegotiationDTO>>> getFarmerOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NegotiationDTO> result = negotiationService.getFarmerNegotiations(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Crops offers fetched successfully!"));
    }

    @PostMapping("/{id}/counter")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<NegotiationDTO>> counterOffer(
            @PathVariable Long id,
            @RequestParam java.math.BigDecimal counterPrice,
            @RequestParam(required = false) String farmerMessage,
            Authentication authentication) {
        NegotiationDTO result = negotiationService.counterOffer(id, counterPrice, farmerMessage,
                authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Counter offer sent!"));
    }
}
