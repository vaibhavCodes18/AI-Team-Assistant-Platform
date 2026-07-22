package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.LoginRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TokenResfreshResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserLoginResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final int REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRegistrationRequest userRegistrationRequest){
        UserResponse userResponse = authService.userRegister(userRegistrationRequest);
        ApiResponse<UserResponse> res = new ApiResponse<>(201, "User successfully register", userResponse);

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response){
        UserLoginResponse userResponse = authService.userLogin(loginRequest);
        ApiResponse<UserLoginResponse> res = new ApiResponse<>(200, "User successfully loggedIn", userResponse);
        // Set HttpOnly refresh token cookie
        addRefreshCookie(response, userResponse.getRefreshToken(), REFRESH_COOKIE_MAX_AGE);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResfreshResponse>> login(@CookieValue(value = REFRESH_COOKIE_NAME, required = false) String refreshToken,
                                                                    HttpServletResponse response){
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "Refresh Token is missing in cookies", null));
        }
        TokenResfreshResponse userResponse = authService.refreshToken(refreshToken);

        addRefreshCookie(response, userResponse.getRefreshtoken(), REFRESH_COOKIE_MAX_AGE);
        ApiResponse<TokenResfreshResponse> res = new ApiResponse<>(201, "User successfully loggedIn", userResponse);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logoout(@CookieValue(value = REFRESH_COOKIE_NAME, required = false) String refreshToken,
                                                                    HttpServletRequest request,
                                                                    HttpServletResponse response){
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "Refresh Token is missing in cookies", null));
        }
        String accessToken =
                request.getHeader("Authorization").substring(7);

        authService.userLogout(refreshToken, accessToken);

        addRefreshCookie(response, "", 0);
        ApiResponse<TokenResfreshResponse> res = new ApiResponse<>(200, "User successfully Logout", null);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> profile(){
        UserResponse userResponse = authService.getCurrentUser();
        ApiResponse<UserResponse> res = new ApiResponse<>(200, "User successfully fetched", userResponse);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody com.ai_powered_app.ai_team_assistant_platform.dto.request.UserUpdateRequest userUpdateRequest){
        UserResponse userResponse = authService.updateCurrentUser(userUpdateRequest);
        ApiResponse<UserResponse> res = new ApiResponse<>(200, "User successfully updated", userResponse);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    private void addRefreshCookie(HttpServletResponse response, String tokenValue, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, tokenValue)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite(cookieSameSite)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

}
