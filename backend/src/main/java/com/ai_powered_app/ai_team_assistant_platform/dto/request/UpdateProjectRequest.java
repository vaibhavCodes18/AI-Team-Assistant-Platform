package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectStatus;
import jakarta.annotation.Nullable;
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
public class UpdateProjectRequest {
    @Nullable
    @Size(max = 100, message = "Project name must not exceed 100 characters")
    private String name;

    @Nullable
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Nullable
    private ProjectStatus status;

    private LocalDate startDate;

    private LocalDate deadline;
}
