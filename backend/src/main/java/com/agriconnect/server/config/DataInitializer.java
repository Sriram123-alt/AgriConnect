package com.agriconnect.server.config;

import com.agriconnect.server.entity.RoleType;
import com.agriconnect.server.entity.User;
import com.agriconnect.server.entity.Crop;
import com.agriconnect.server.repository.UserRepository;
import com.agriconnect.server.repository.CropRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user
        String adminEmail = "admin@agri.local";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .fullName("Platform Admin")
                    .password(passwordEncoder.encode("Admin123!"))
                    .role(RoleType.ROLE_ADMIN)
                    .isApproved(true)
                    .build();
            userRepository.save(admin);
            System.out.println("✓ Created admin: " + adminEmail + " / Admin123!");
        }

        // Create test farmer
        String farmerEmail = "farmer@agri.local";
        User farmer = null;
        if (!userRepository.existsByEmail(farmerEmail)) {
            farmer = User.builder()
                    .email(farmerEmail)
                    .fullName("Green Valley Farm")
                    .password(passwordEncoder.encode("Farmer123!"))
                    .phoneNumber("555-1000")
                    .address("123 Farm Road, CA")
                    .role(RoleType.ROLE_FARMER)
                    .isApproved(true)
                    .build();
            farmer = userRepository.save(farmer);
            System.out.println("✓ Created farmer: " + farmerEmail + " / Farmer123!");
        } else {
            farmer = userRepository.findByEmail(farmerEmail).orElse(null);
        }

        // Create test buyer
        String buyerEmail = "buyer@agri.local";
        if (!userRepository.existsByEmail(buyerEmail)) {
            User buyer = User.builder()
                    .email(buyerEmail)
                    .fullName("Fresh Foods Co.")
                    .password(passwordEncoder.encode("Buyer123!"))
                    .phoneNumber("555-2000")
                    .address("456 Market St, NY")
                    .role(RoleType.ROLE_BUYER)
                    .isApproved(true)
                    .build();
            userRepository.save(buyer);
            System.out.println("✓ Created buyer: " + buyerEmail + " / Buyer123!");
        }

        // Seed sample crops if farmer exists
        if (farmer != null && cropRepository.count() == 0) {
            Crop[] sampleCrops = {
                Crop.builder()
                        .name("Organic Red Tomatoes")
                        .pricePerKg(new BigDecimal("3.50"))
                        .quantity(500.0)
                        .unit("kg")
                        .harvestDate(LocalDate.now().plusDays(5))
                        .organic(true)
                        .description("Fresh, hand-picked organic red tomatoes")
                        .location("Salinas, CA")
                        .farmer(farmer)
                        .build(),
                Crop.builder()
                        .name("Fresh Sweet Corn")
                        .pricePerKg(new BigDecimal("2.00"))
                        .quantity(300.0)
                        .unit("piece")
                        .harvestDate(LocalDate.now().plusDays(3))
                        .organic(false)
                        .description("Sweet corn harvested fresh daily")
                        .location("Salinas, CA")
                        .farmer(farmer)
                        .build(),
                Crop.builder()
                        .name("Crisp Lettuce")
                        .pricePerKg(new BigDecimal("1.80"))
                        .quantity(200.0)
                        .unit("kg")
                        .harvestDate(LocalDate.now().plusDays(2))
                        .organic(true)
                        .description("Hydroponic lettuce with superior freshness")
                        .location("Salinas, CA")
                        .farmer(farmer)
                        .build(),
                Crop.builder()
                        .name("Baby Carrots")
                        .pricePerKg(new BigDecimal("2.50"))
                        .quantity(250.0)
                        .unit("kg")
                        .harvestDate(LocalDate.now().plusDays(4))
                        .organic(false)
                        .description("Sweet baby carrots, ready to eat")
                        .location("Salinas, CA")
                        .farmer(farmer)
                        .build()
            };

            for (Crop crop : sampleCrops) {
                cropRepository.save(crop);
            }
            System.out.println("✓ Seeded " + sampleCrops.length + " sample crops");
        }
    }
}
