package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.NegotiationDTO;
import java.math.BigDecimal;
import com.agriconnect.server.entity.Crop;
import com.agriconnect.server.entity.Negotiation;
import com.agriconnect.server.entity.User;
import com.agriconnect.server.repository.CropRepository;
import com.agriconnect.server.repository.NegotiationRepository;
import com.agriconnect.server.repository.UserRepository;
import com.agriconnect.server.service.NegotiationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NegotiationServiceImpl implements NegotiationService {

    @Autowired
    private NegotiationRepository negotiationRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.agriconnect.server.service.NotificationService notificationService;

    @Override
    @Transactional
    public NegotiationDTO createOffer(NegotiationDTO negotiationDTO, String email) {
        User buyer = userRepository.findByEmail(email).orElseThrow();
        Crop crop = cropRepository.findById(negotiationDTO.getCropId()).orElseThrow();

        Negotiation negotiation = Negotiation.builder()
                .buyer(buyer)
                .crop(crop)
                .offeredPrice(negotiationDTO.getOfferedPrice())
                .quantity(negotiationDTO.getQuantity())
                .status(Negotiation.NegotiationStatus.PENDING)
                .message(negotiationDTO.getMessage())
                .build();

        Negotiation saved = negotiationRepository.save(negotiation);

        notificationService.createNotification(
                crop.getFarmer(),
                "New Price Negotiation",
                String.format("Buyer %s has offered ₹%s for your crop %s.", buyer.getFullName(),
                        negotiation.getOfferedPrice(), crop.getName()),
                "NEGOTIATION",
                "/negotiations");

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public NegotiationDTO updateStatus(Long id, Negotiation.NegotiationStatus status, String email) {
        Negotiation negotiation = negotiationRepository.findById(id).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();

        // Check if user is either the buyer or the farmer of the crop
        boolean isBuyer = negotiation.getBuyer().getId().equals(user.getId());
        boolean isFarmer = negotiation.getCrop().getFarmer().getId().equals(user.getId());

        if (!isBuyer && !isFarmer) {
            throw new RuntimeException("Unauthorized to update this negotiation");
        }

        negotiation.setStatus(status);
        Negotiation saved = negotiationRepository.save(negotiation);

        User targetUser = isFarmer ? negotiation.getBuyer() : negotiation.getCrop().getFarmer();
        String action = status == Negotiation.NegotiationStatus.ACCEPTED ? "accepted" : "rejected";
        notificationService.createNotification(
                targetUser,
                "Negotiation Update",
                String.format("The negotiation for crop %s has been %s.", negotiation.getCrop().getName(), action),
                "NEGOTIATION",
                "/negotiations");

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public NegotiationDTO counterOffer(Long id, BigDecimal counterPrice, String farmerMessage, String email) {
        Negotiation negotiation = negotiationRepository.findById(id).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();

        // Only farmer can counter
        boolean isFarmer = negotiation.getCrop().getFarmer().getId().equals(user.getId());
        if (!isFarmer) {
            throw new RuntimeException("Only the farmer can make a counter offer");
        }

        negotiation.setCounterPrice(counterPrice);
        negotiation.setFarmerMessage(farmerMessage);
        negotiation.setStatus(Negotiation.NegotiationStatus.COUNTERED);

        Negotiation saved = negotiationRepository.save(negotiation);

        notificationService.createNotification(
                negotiation.getBuyer(),
                "Counter Offer Received",
                String.format("Farmer %s has made a counter offer of ₹%s for crop %s.", user.getFullName(),
                        counterPrice, negotiation.getCrop().getName()),
                "NEGOTIATION",
                "/negotiations");

        return mapToDTO(saved);
    }

    @Override
    public Page<NegotiationDTO> getBuyerNegotiations(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email).orElseThrow();
        return negotiationRepository.findByBuyer(buyer, pageable).map(this::mapToDTO);
    }

    @Override
    public Page<NegotiationDTO> getFarmerNegotiations(String email, Pageable pageable) {
        User farmer = userRepository.findByEmail(email).orElseThrow();
        return negotiationRepository.findByCropFarmer(farmer, pageable).map(this::mapToDTO);
    }

    private NegotiationDTO mapToDTO(Negotiation n) {
        return NegotiationDTO.builder()
                .id(n.getId())
                .cropId(n.getCrop().getId())
                .cropName(n.getCrop().getName())
                .buyerId(n.getBuyer().getId())
                .buyerName(n.getBuyer().getFullName())
                .offeredPrice(n.getOfferedPrice())
                .originalPrice(n.getCrop().getPricePerKg())
                .quantity(n.getQuantity())
                .status(n.getStatus())
                .message(n.getMessage())
                .counterPrice(n.getCounterPrice())
                .farmerMessage(n.getFarmerMessage())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
