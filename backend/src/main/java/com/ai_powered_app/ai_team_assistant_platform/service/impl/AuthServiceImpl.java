package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.LoginRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TokenResfreshResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.RefreshToken;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.enums.AuthProvider;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.DuplicateResourceException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.JwtBlacklistService;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.UserRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.RefreshTokenRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.security.CustomUserDetails;
import com.ai_powered_app.ai_team_assistant_platform.security.JWTService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AuthService;
import com.ai_powered_app.ai_team_assistant_platform.utils.CalculateRemainingTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Date;

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

    @Autowired
    private UserRedisService redisService;

    @Autowired
    private JwtBlacklistService jwtBlacklistService;


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

    @Override
    public TokenResfreshResponse refreshToken(String refreshToken) {

        try {
            RefreshToken dbRefreshToken = refreshTokenRepository.findByToken(refreshToken).orElseThrow(() -> new
                    ResourceNotFoundException("Refresh token is invalid"));

            if(dbRefreshToken.getIsRevoked()){
                throw new BadCredentialsException("Refresh token is revoked");
            }

            String email = jwtService.extractEmail(refreshToken);

            if(email != null){
                User user = userRepository.findByEmail(email).orElseThrow(() ->
                        new ResourceNotFoundException("User with email: " + email + " not found"));

                if(!dbRefreshToken.getUser().getId().equals(user.getId())){
                    dbRefreshToken.setIsRevoked(true);
                    refreshTokenRepository.save(dbRefreshToken);
                    throw new BadCredentialsException("Refresh token is invalid");
                }

                if (jwtService.isRefreshTokenValid(refreshToken, user.getEmail())){
                    String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
                    String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

                    dbRefreshToken.setIsRevoked(true);
                    refreshTokenRepository.save(dbRefreshToken);

                    RefreshToken newTokens = new RefreshToken();
                    newTokens.setToken(newRefreshToken);
                    newTokens.setUser(user);
                    newTokens.setIsRevoked(false);
                    refreshTokenRepository.save(newTokens);

                    return new TokenResfreshResponse(newAccessToken, newRefreshToken);

                }else{
                    dbRefreshToken.setIsRevoked(true);
                    refreshTokenRepository.save(dbRefreshToken);
                }

            }
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid or expired refresh token: " + e.getMessage());
        }

        throw new BadCredentialsException("Invalid refresh token");
    }

    @Override
    public void userLogout(String refreshToken, String accessToken) {

        Date expirationAccessDate = jwtService.extractExpiration(accessToken);
        Date expirationRefreshDate = jwtService.extractExpiration(refreshToken);

        long remainingTimeAccess = CalculateRemainingTime.calculateTime(expirationAccessDate);
        long remainingTimeRefresh = CalculateRemainingTime.calculateTime(expirationRefreshDate);

        jwtBlacklistService.saveBlackListJwt(accessToken, "access", Duration.ofMillis(remainingTimeAccess));
        jwtBlacklistService.saveBlackListJwt(refreshToken, "refresh", Duration.ofMillis(remainingTimeRefresh));

        if(refreshToken.trim().isEmpty()){
            throw new BadCredentialsException("Refresh token is required for logout");
        }

        RefreshToken dbRefreshToken = refreshTokenRepository.findByToken(refreshToken).orElseThrow(() -> new ResourceNotFoundException("Refresh token is invalid"));
        dbRefreshToken.setIsRevoked(true);
        refreshTokenRepository.save(dbRefreshToken);
    }

    @Override
    public UserResponse getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails)
                        authentication.getPrincipal();

        Long userId = userDetails.getId();

        UserResponse cachedUser = redisService.getRedisUser(userId);

        if(cachedUser != null) return cachedUser;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this id."));

        UserResponse response = getUserResponse(user);

        redisService.saveRedisUser(user.getId(), response, Duration.ofMinutes(10L));

        return response;
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
