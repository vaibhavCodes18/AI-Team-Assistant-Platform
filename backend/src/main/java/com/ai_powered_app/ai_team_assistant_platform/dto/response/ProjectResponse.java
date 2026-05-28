package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private Long workspaceId;
    private String name;
    private String description;
    private ProjectStatus status;
    private UserResponse createdBy;
    private LocalDate startDate;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
