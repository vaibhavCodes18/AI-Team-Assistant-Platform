package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.LoginRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TokenResfreshResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;

import org.springframework.security.oauth2.core.user.OAuth2User;

public interface AuthService {

    UserResponse userRegister(UserRegistrationRequest userRegistrationRequest);
    
    UserLoginResponse userLogin(LoginRequest loginRequest);
    

    
    TokenResfreshResponse refreshToken(String refreshToken);
    
    void userLogout(String refreshToken, String authHeader);
    
    UserResponse getCurrentUser();
    
    UserResponse updateCurrentUser(com.ai_powered_app.ai_team_assistant_platform.dto.request.UserUpdateRequest request);
}
