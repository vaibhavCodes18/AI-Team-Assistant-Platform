package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResfreshResponse {
    private String accessToken;

    @JsonIgnore
    private String refreshtoken;
}
