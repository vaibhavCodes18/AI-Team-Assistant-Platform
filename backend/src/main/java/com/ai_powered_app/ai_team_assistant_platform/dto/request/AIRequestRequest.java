package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.AIRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequestRequest {

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;

    private Long projectId;

    @NotNull(message = "AI request type is required")
    private AIRequestType type;

    @NotBlank(message = "Input text is required")
    private String inputText;
}
