package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskListResponse {

    private Long id;

    private String title;

    private TaskStatus status;

    private TaskPriority priority;

    private String assignedUserName;

    private LocalDate dueDate;

}
