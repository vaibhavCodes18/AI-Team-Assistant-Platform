package com.ai_powered_app.ai_team_assistant_platform.security.oauth2;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.Oauth2Service;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class Oauth2SuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/success}")
    private String authorizedRedirectUri;

    private final Oauth2Service oauth2Service;

    public Oauth2SuccessHandler(Oauth2Service oauth2Service) {
        this.oauth2Service = oauth2Service;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OAuth2User user = (OAuth2User) authentication.getPrincipal();
        String registrationId = token.getAuthorizedClientRegistrationId();

        UserLoginResponse loginResponse = oauth2Service.handleOauth2LoinRequest(user, registrationId);

        // Add access_token cookie (non-HttpOnly so frontend JS can read it, short
        // lifespan of 15 min)
        addCookie(response, "access_token", loginResponse.getAccessToken(), 15 * 60, false);

        // Add refreshToken cookie (HttpOnly for backend refresh endpoint, lifespan of 7
        // days)
        addCookie(response, "refreshToken", loginResponse.getRefreshToken(), 7 * 24 * 60 * 60, true);

        String targetUrl = authorizedRedirectUri.contains("?")
                ? authorizedRedirectUri + "&access_token=" + loginResponse.getAccessToken()
                : authorizedRedirectUri + "?access_token=" + loginResponse.getAccessToken();

        response.sendRedirect(targetUrl);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge, boolean httpOnly) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite(cookieSameSite)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
