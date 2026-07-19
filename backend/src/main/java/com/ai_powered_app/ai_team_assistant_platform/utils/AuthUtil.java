package com.ai_powered_app.ai_team_assistant_platform.utils;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.ai_powered_app.ai_team_assistant_platform.enums.AuthProvider;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthUtil {

    public AuthProvider getAuthProvider(String registartionId) {
        if(registartionId.equals("google")) {
            return AuthProvider.GOOGLE;
        } else if(registartionId.equals("github")) {
            return AuthProvider.GITHUB;
        }

        log.error("Provider is not valid");
        throw new BadCredentialsException("Provider is not valid");
    }

    public String getproviderId(OAuth2User oAuth2User, String registartionId) {
        if(registartionId.equals("google")) {
            log.info("Google provider ID");
            return oAuth2User.getAttribute("sub").toString();
        } else if(registartionId.equals("github")) {
            log.info("Github provider ID");
            return oAuth2User.getAttribute("id").toString();
        }

        log.error("Provider is not valid");
        throw new BadCredentialsException("Provider is not valid");
    }
    
}
