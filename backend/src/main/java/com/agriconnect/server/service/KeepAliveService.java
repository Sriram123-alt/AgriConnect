package com.agriconnect.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class KeepAliveService {
    private static final Logger logger = LoggerFactory.getLogger(KeepAliveService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // Ping Every 10 minutes (600,000 milliseconds)
    // To prevent Render from sleeping (which happens after 15 mins of inactivity)
    @Scheduled(fixedRate = 600000)
    public void keepAlive() {
        if (baseUrl.contains("localhost")) {
            return; // Skip for local development
        }

        try {
            String url = baseUrl + "/api/health";
            logger.info("Keep-alive ping to: {}", url);
            restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            logger.error("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
