package com.agriconnect.server.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DatabaseSchemaFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSchema() {
        try {
            // Postgres check constraints for enums often have names like 'users_role_check'
            // We drop it to allow new enum values to be inserted.
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            System.out.println("Successfully dropped users_role_check constraint to allow ROLE_TRANSPORT");
        } catch (Exception e) {
            System.err.println("Could not drop constraint: " + e.getMessage());
        }
    }
}
