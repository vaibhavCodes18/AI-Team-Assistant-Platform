package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.LoginRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.RefreshToken;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.enums.AuthProvider;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.DuplicateResourceException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.RefreshTokenRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.security.JWTService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Override
    public UserResponse userRegister(UserRegistrationRequest userRegistrationRequest) {

        if(userRepository.existsByEmail(userRegistrationRequest.getEmail())){
            throw new DuplicateResourceException(
                    "A user with email '" + userRegistrationRequest.getEmail() + "' already exists");
        }

        User user = new User();
        user.setEmail(userRegistrationRequest.getEmail());
        user.setName(userRegistrationRequest.getName());
        user.setPassword(passwordEncoder.encode(userRegistrationRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        User savedUser = userRepository.save(user);

        return getUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserLoginResponse userLogin(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Users with this email is invalid."));
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        if (!authentication.isAuthenticated()) {
            throw new BadCredentialsException("Users credentials are invalid.");
        }
        refreshTokenRepository.revokeAllByUserId(user.getId());
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenString = jwtService.generateRefreshToken(user.getEmail());
        RefreshToken refreshToken = new RefreshToken(user, refreshTokenString, false);

        refreshTokenRepository.save(refreshToken);

        return new UserLoginResponse(accessToken, refreshTokenString);
    }

    private static UserResponse getUserResponse(User savedUser) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setName(savedUser.getName());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setProvider(savedUser.getProvider());
        userResponse.setProfileImage(savedUser.getProfileImage());
        userResponse.setIsActive(savedUser.getIsActive());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());
        return userResponse;
    }
}
