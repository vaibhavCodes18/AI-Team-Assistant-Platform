package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
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
public class WorkspaceMemberRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Workspace role is required")
    private WorkspaceRole role;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;
}
