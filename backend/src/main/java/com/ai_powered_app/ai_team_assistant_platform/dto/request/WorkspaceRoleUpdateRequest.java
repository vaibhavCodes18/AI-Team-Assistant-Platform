package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceRoleUpdateRequest {
    @NotNull(message = "Workspace role is required")
    private WorkspaceRole role;
}
