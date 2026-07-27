package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.RefreshToken;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.enums.AuthProvider;
import com.ai_powered_app.ai_team_assistant_platform.enums.PlatformRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.repository.RefreshTokenRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.security.JWTService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.Oauth2Service;
import com.ai_powered_app.ai_team_assistant_platform.utils.AuthUtil;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class Oauth2ServiceImpl implements Oauth2Service {

    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthUtil authUtil;

    public Oauth2ServiceImpl(UserRepository userRepository,
                             JWTService jwtService,
                             RefreshTokenRepository refreshTokenRepository,
                             AuthUtil authUtil) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.authUtil = authUtil;
    }

    @Override
    @Transactional
    public UserLoginResponse handleOauth2LoinRequest(OAuth2User oAuth2User, String registrationId) {
        Object emailVerifiedObj = oAuth2User.getAttribute("email_verified");
        boolean verified = false;
        if (emailVerifiedObj instanceof Boolean) {
            verified = (Boolean) emailVerifiedObj;
        } else if (emailVerifiedObj instanceof String) {
            verified = Boolean.parseBoolean((String) emailVerifiedObj);
        }
        if (!verified) {
            throw new BadCredentialsException("Email is not verified.");
        }

        AuthProvider authProvider = authUtil.getAuthProvider(registrationId);
        String providerId = authUtil.getproviderId(oAuth2User, registrationId);

        User user = userRepository.findByProviderUserIdAndProvider(providerId, authProvider).orElse(null);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User emailUser = userRepository.findByEmail(email).orElse(null);

        if(user == null && emailUser != null){
            emailUser.setProvider(authProvider);
            emailUser.setProviderUserId(providerId);
            user = emailUser;
        }else if(user == null && emailUser == null){
            user = new User();
            user.setProvider(authProvider);
            user.setProviderUserId(providerId);
            user.setEmail(email);
            user.setName(name);
            user.setProfileImage(picture);
            user.setPlatformRole(PlatformRole.Standard_Member);
            user.setPassword(null);
        }
        user = userRepository.save(user);

        if(!user.getIsActive()){
            throw new BadCredentialsException("Your account is disabled.");
        }

        refreshTokenRepository.revokeAllByUserId(user.getId());
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenString = jwtService.generateRefreshToken(user.getEmail());
        RefreshToken refreshToken = new RefreshToken(user, refreshTokenString, false);

        refreshTokenRepository.save(refreshToken);

        return new UserLoginResponse(accessToken, refreshTokenString);
    }
}
