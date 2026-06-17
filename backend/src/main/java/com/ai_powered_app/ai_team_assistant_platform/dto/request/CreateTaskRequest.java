package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTaskRequest {

    @NotBlank(message = "Task title is required.")
    @Size(max = 150)
    private String title;

    @NotBlank(message = "Task description is required.")
    @Size(max = 5000)
    private String description;

    @NotNull(message = "Priority is required.")
    private TaskPriority priority;

    @NotNull(message = "Project id is required.")
    private Long projectId;

    private Long assignedToUserId;

    private LocalDate startDate;

    private LocalDate dueDate;

    @Positive(message = "Estimated hours must be greater than zero.")
    private Integer estimatedHours;

}
