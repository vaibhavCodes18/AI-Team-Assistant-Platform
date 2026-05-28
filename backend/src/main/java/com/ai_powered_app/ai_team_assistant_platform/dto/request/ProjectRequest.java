package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;

    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Project status is required")
    private ProjectStatus status;

    private LocalDate startDate;

    private LocalDate deadline;
}
