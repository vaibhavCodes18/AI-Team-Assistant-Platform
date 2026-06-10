package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private Long workspaceId;
    private Long userId;
    private String action;
    private String entityType;
    private Long entityId;
    private String metadata;
    private LocalDateTime createdAt;
}
