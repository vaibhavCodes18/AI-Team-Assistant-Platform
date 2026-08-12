package com.ai_powered_app.ai_team_assistant_platform.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetSuccessEmailEvent {
    private Long userId;
    private String email;
    private String userName;
}
