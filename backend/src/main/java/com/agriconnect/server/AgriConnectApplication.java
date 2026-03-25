package com.agriconnect.server;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class AgriConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgriConnectApplication.class, args);
	}

    @Bean
    public CommandLineRunner updateDatabaseSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE reviews ALTER COLUMN buyer_id DROP NOT NULL");
                System.out.println("Successfully removed NOT NULL constraint from reviews.buyer_id");
            } catch (Exception e) {
                // Column might not exist or already nullable, safely ignore
            }
        };
    }
}
