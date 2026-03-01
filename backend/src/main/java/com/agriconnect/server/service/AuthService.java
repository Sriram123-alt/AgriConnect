package com.agriconnect.server.service;

import com.agriconnect.server.dto.LoginRequest;
import com.agriconnect.server.dto.LoginResponse;
import com.agriconnect.server.dto.RegisterRequest;
import com.agriconnect.server.entity.User;

public interface AuthService {
    User register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}
