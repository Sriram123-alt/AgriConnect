package com.agriconnect.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CropDTO {
    private Long id;
    private String name;
    private BigDecimal pricePerKg;
    private Double quantity;
    private String unit;
    private LocalDate harvestDate;
    private boolean organic;
    private String description;
    private String location;
    private Long farmerId;
    private String farmerName;
    private List<String> imageUrls;
    private Double averageRating;
}
