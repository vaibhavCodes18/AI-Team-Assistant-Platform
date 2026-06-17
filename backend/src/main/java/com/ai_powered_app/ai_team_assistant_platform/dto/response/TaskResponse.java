package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {

    private Long id;

    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private LocalDate startDate;

    private LocalDate dueDate;

    private Integer estimatedHours;

    private Boolean archived;

    private Long workspaceId;

    private String workspaceName;

    private Long projectId;

    private String projectName;

    private Long assignedUserId;

    private String assignedUserName;

    private Long createdByUserId;

    private String createdByUserName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
