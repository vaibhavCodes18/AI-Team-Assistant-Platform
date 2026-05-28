package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogRequest {

    private Long workspaceId;

    @NotBlank(message = "Action is required")
    @Size(max = 100, message = "Action must not exceed 100 characters")
    private String action;

    @NotBlank(message = "Entity type is required")
    @Size(max = 100, message = "Entity type must not exceed 100 characters")
    private String entityType;

    private Long entityId;

    private String metadata;
}
