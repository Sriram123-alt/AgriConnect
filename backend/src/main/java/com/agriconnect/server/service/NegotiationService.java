package com.agriconnect.server.service;

import com.agriconnect.server.dto.NegotiationDTO;
import java.math.BigDecimal;
import com.agriconnect.server.entity.Negotiation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NegotiationService {
    NegotiationDTO createOffer(NegotiationDTO negotiationDTO, String email);

    NegotiationDTO updateStatus(Long id, Negotiation.NegotiationStatus status, String email);

    NegotiationDTO counterOffer(Long id, BigDecimal counterPrice, String farmerMessage, String email);

    Page<NegotiationDTO> getBuyerNegotiations(String email, Pageable pageable);

    Page<NegotiationDTO> getFarmerNegotiations(String email, Pageable pageable);
}
