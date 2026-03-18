package com.agriconnect.server.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public String index() {
        return "AgriConnect Backend API is UP and Running! Use /api/... for endpoints.";
    }
}
