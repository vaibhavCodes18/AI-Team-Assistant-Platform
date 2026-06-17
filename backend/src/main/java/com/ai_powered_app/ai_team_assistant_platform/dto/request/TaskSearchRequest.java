package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskSearchRequest {

    private String keyword;

    private TaskStatus status;

    private TaskPriority priority;

    private Long assignedUserId;

    private Long projectId;

}
