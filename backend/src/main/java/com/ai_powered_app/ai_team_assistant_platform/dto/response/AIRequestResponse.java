package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.ai_powered_app.ai_team_assistant_platform.enums.AIRequestStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.AIRequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequestResponse {
    private Long id;
    private Long workspaceId;
    private Long projectId;
    private Long userId;
    private AIRequestType type;
    private String inputText;
    private String responseText;
    private AIRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
