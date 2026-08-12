package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ForgotPasswordRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.LoginRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.ResetPasswordRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TokenResfreshResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.PasswordResetToken;
import com.ai_powered_app.ai_team_assistant_platform.entity.RefreshToken;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.enums.AuthProvider;
import com.ai_powered_app.ai_team_assistant_platform.enums.PlatformRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.DuplicateResourceException;
import com.ai_powered_app.ai_team_assistant_platform.exception.PasswordResetTokenException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.PasswordResetEmailEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.PasswordResetSuccessEmailEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.producer.PasswordResetEmailProducer;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.JwtBlacklistService;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.UserRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.PasswordResetTokenRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.RefreshTokenRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.security.CustomUserDetails;
import com.ai_powered_app.ai_team_assistant_platform.security.JWTService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AuthService;
import com.ai_powered_app.ai_team_assistant_platform.utils.CalculateRemainingTime;
import com.ai_powered_app.ai_team_assistant_platform.utils.PasswordResetTokenUtil;

import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRedisService redisService;
    private final JwtBlacklistService jwtBlacklistService;
    private final PasswordResetTokenUtil passwordResetTokenUtil;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetEmailProducer passwordResetEmailProducer;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JWTService jwtService,
                           RefreshTokenRepository refreshTokenRepository,
                           UserRedisService redisService,
                           JwtBlacklistService jwtBlacklistService,
                           PasswordResetTokenUtil passwordResetTokenUtil,
                           PasswordResetTokenRepository passwordResetTokenRepository, 
                           PasswordResetEmailProducer passwordResetEmailProducer) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.redisService = redisService;
        this.jwtBlacklistService = jwtBlacklistService;
        this.passwordResetTokenUtil = passwordResetTokenUtil;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordResetEmailProducer = passwordResetEmailProducer;
    }


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
        user.setPlatformRole(PlatformRole.Standard_Member);
        user.setProvider(AuthProvider.LOCAL);
        user.setDesignation(userRegistrationRequest.getDesignation());
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

    @Override
    @Transactional
    public UserResponse updateCurrentUser(com.ai_powered_app.ai_team_assistant_platform.dto.request.UserUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this id."));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation());
        }
        user.setPlatformRole(PlatformRole.Standard_Member);
        User savedUser = userRepository.save(user);
        UserResponse response = getUserResponse(savedUser);

        // Update the redis cache with updated user response
        redisService.saveRedisUser(savedUser.getId(), response, Duration.ofMinutes(10L));

        return response;
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("If an account exists for this email, you will receive a password reset link."));

        passwordResetTokenRepository.invalidatePreviousTokens(user.getId());

        String rawToken = passwordResetTokenUtil.generateToken();
        String tokenHash = passwordResetTokenUtil.hashToken(rawToken);

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setTokenHash(tokenHash);
        passwordResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordResetToken.setIsUsed(false);
        passwordResetTokenRepository.save(passwordResetToken);

        String resetUrl = "http://localhost:5173/reset-password?token=" + rawToken;

        log.info("Sending password reset email to user ID: {}, email: {}", user.getId(), user.getEmail());
        PasswordResetEmailEvent event = new PasswordResetEmailEvent();
        event.setUserId(user.getId());
        event.setEmail(user.getEmail());
        event.setUserName(user.getName());
        event.setResetLink(resetUrl);
        passwordResetEmailProducer.publishPasswordResetEmailEvent(event);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest passwordRequest){
        String tokenHash = passwordResetTokenUtil.hashToken(passwordRequest.getToken());
        
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByTokenHashAndIsUsedFalse(tokenHash).orElseThrow(() -> new ResourceNotFoundException("Invalid token"));

        if(passwordResetToken.getIsUsed()){
            throw new PasswordResetTokenException("Invalid token");
        }

        if(passwordResetToken.getExpiresAt().isBefore(LocalDateTime.now())){
            throw new PasswordResetTokenException("Invalid or expired token");
        }

        User user = passwordResetToken.getUser();

        user.setPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
        userRepository.save(user);

        passwordResetToken.setIsUsed(true);
        passwordResetTokenRepository.save(passwordResetToken);

        PasswordResetSuccessEmailEvent event = new PasswordResetSuccessEmailEvent();
        event.setUserId(user.getId());
        event.setEmail(user.getEmail());
        event.setUserName(user.getName());
        passwordResetEmailProducer.publishPasswordResetSuccessEmailEvent(event);
    }

    private static UserResponse getUserResponse(User savedUser) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setName(savedUser.getName());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setProvider(savedUser.getProvider());
        userResponse.setProfileImage(savedUser.getProfileImage());
        userResponse.setDesignation(savedUser.getDesignation());
        userResponse.setPlatformRole(savedUser.getPlatformRole());
        userResponse.setIsActive(savedUser.getIsActive());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());
        return userResponse;
    }
}
