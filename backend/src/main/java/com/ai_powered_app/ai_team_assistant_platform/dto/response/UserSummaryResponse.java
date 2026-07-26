package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String profileImage;
}
