package com.agriconnect.server.service.impl;

import com.agriconnect.server.dto.CropDTO;
import com.agriconnect.server.entity.Crop;
import com.agriconnect.server.entity.CropImage;
import com.agriconnect.server.entity.User;
import com.agriconnect.server.repository.CropRepository;
import com.agriconnect.server.repository.UserRepository;
import com.agriconnect.server.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class CropServiceImpl implements CropService {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.agriconnect.server.repository.ReviewRepository reviewRepository;

    @Override
    @Transactional
    public CropDTO createCrop(CropDTO cropDTO, String email) {
        User farmer = userRepository.findByEmail(email).orElseThrow();

        Crop crop = Crop.builder()
                .name(cropDTO.getName())
                .pricePerKg(cropDTO.getPricePerKg())
                .quantity(cropDTO.getQuantity())
                .unit(cropDTO.getUnit())
                .harvestDate(cropDTO.getHarvestDate())
                .organic(cropDTO.isOrganic())
                .description(cropDTO.getDescription())
                .location(cropDTO.getLocation())
                .farmer(farmer)
                .averageRating(0.0)
                .build();

        if (cropDTO.getImageUrls() != null) {
            crop.setImages(cropDTO.getImageUrls().stream()
                    .map(url -> CropImage.builder().imageUrl(url).crop(crop).build())
                    .collect(Collectors.toList()));
        }

        Crop savedCrop = cropRepository.save(crop);
        return mapToDTO(savedCrop);
    }

    @Override
    @Transactional
    public CropDTO updateCrop(Long id, CropDTO cropDTO, String email) {
        Crop crop = cropRepository.findById(id).orElseThrow(() -> new RuntimeException("Crop not found"));
        if (!crop.getFarmer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update this crop");
        }

        crop.setName(cropDTO.getName());
        crop.setPricePerKg(cropDTO.getPricePerKg());
        crop.setQuantity(cropDTO.getQuantity());
        crop.setOrganic(cropDTO.isOrganic());
        crop.setDescription(cropDTO.getDescription());
        crop.setHarvestDate(cropDTO.getHarvestDate());
        crop.setLocation(cropDTO.getLocation());

        // Simple approach for images update: clear and re-add
        if (cropDTO.getImageUrls() != null) {
            crop.getImages().clear();
            crop.getImages().addAll(cropDTO.getImageUrls().stream()
                    .map(url -> CropImage.builder().imageUrl(url).crop(crop).build())
                    .collect(Collectors.toList()));
        }

        return mapToDTO(cropRepository.save(crop));
    }

    @Override
    @Transactional
    public void deleteCrop(Long id, String email) {
        Crop crop = cropRepository.findById(id).orElseThrow(() -> new RuntimeException("Crop not found"));
        if (!crop.getFarmer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to delete this crop");
        }
        crop.setActive(false);
        cropRepository.save(crop);
    }

    @Override
    @Transactional
    public void deleteCropAdmin(Long id) {
        Crop crop = cropRepository.findById(id).orElseThrow(() -> new RuntimeException("Crop not found"));
        crop.setActive(false);
        cropRepository.save(crop);
    }

    @Override
    public CropDTO getCropById(Long id) {
        Crop crop = cropRepository.findById(id).orElseThrow(() -> new RuntimeException("Crop not found"));
        return mapToDTO(crop);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CropDTO> getFarmerCrops(String email, Pageable pageable) {
        User farmer = userRepository.findByEmail(email).orElseThrow();
        return cropRepository.findByFarmer(farmer, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CropDTO> searchCrops(String name, Boolean organic, BigDecimal minPrice, BigDecimal maxPrice,
            Pageable pageable) {
        String namePattern = (name != null && !name.isEmpty()) ? "%" + name + "%" : null;
        return cropRepository.searchCrops(namePattern, organic, minPrice, maxPrice, pageable).map(this::mapToDTO);
    }

    private CropDTO mapToDTO(Crop crop) {
        Double farmerAvg = reviewRepository.getAverageRatingForUser(crop.getFarmer().getId());
        return CropDTO.builder()
                .id(crop.getId())
                .name(crop.getName())
                .pricePerKg(crop.getPricePerKg())
                .quantity(crop.getQuantity())
                .unit(crop.getUnit())
                .harvestDate(crop.getHarvestDate())
                .organic(crop.isOrganic())
                .description(crop.getDescription())
                .location(crop.getLocation())
                .farmerId(crop.getFarmer().getId())
                .farmerName(crop.getFarmer().getFullName())
                .averageRating(crop.getAverageRating())
                .farmerRating(farmerAvg != null ? Math.round(farmerAvg * 10.0) / 10.0 : 0.0)
                .imageUrls(crop.getImages().stream().map(CropImage::getImageUrl).collect(Collectors.toList()))
                .build();
    }
}
