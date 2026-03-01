package com.agriconnect.server.service;

import com.agriconnect.server.dto.CropDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface CropService {
    CropDTO createCrop(CropDTO cropDTO, String email);

    CropDTO updateCrop(Long id, CropDTO cropDTO, String email);

    void deleteCrop(Long id, String email);

    void deleteCropAdmin(Long id);

    CropDTO getCropById(Long id);

    Page<CropDTO> getFarmerCrops(String email, Pageable pageable);

    Page<CropDTO> searchCrops(String name, Boolean organic, BigDecimal minPrice, BigDecimal maxPrice,
            Pageable pageable);
}
