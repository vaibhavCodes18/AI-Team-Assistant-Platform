package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Notification title is required")
    @Size(max = 150, message = "Notification title must not exceed 150 characters")
    private String title;

    @NotBlank(message = "Notification message is required")
    @Size(max = 1000, message = "Notification message must not exceed 1000 characters")
    private String message;

    @NotBlank(message = "Notification type is required")
    @Size(max = 50, message = "Notification type must not exceed 50 characters")
    private String type;
}
