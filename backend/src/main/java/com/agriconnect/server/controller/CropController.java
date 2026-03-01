package com.agriconnect.server.controller;

import com.agriconnect.server.dto.ApiResponse;
import com.agriconnect.server.dto.CropDTO;
import com.agriconnect.server.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropService cropService;

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<CropDTO>> addCrop(@RequestBody CropDTO cropDTO, Authentication authentication) {
        CropDTO result = cropService.createCrop(cropDTO, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Crop added successfully!"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<CropDTO>> updateCrop(@PathVariable Long id, @RequestBody CropDTO cropDTO,
            Authentication authentication) {
        CropDTO result = cropService.updateCrop(id, cropDTO, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(result, "Crop updated successfully!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCrop(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            cropService.deleteCropAdmin(id);
        } else {
            cropService.deleteCrop(id, authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Crop deleted successfully!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CropDTO>> getCropById(@PathVariable Long id) {
        CropDTO result = cropService.getCropById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Crop fetched successfully!"));
    }

    @GetMapping("/farmer/me")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<Page<CropDTO>>> getMyCrops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CropDTO> result = cropService.getFarmerCrops(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Farmer crops fetched successfully!"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CropDTO>>> searchCrops(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean organic,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CropDTO> result = cropService.searchCrops(name, organic, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Crops searched successfully!"));
    }
}
