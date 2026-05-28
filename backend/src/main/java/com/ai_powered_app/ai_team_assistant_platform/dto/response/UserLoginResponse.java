package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private String accessToken;
    private String refreshToken;
}
