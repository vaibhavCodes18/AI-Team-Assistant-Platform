package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface Oauth2Service {
    UserLoginResponse handleOauth2LoinRequest(OAuth2User oAuth2User, String registrationId);
}
