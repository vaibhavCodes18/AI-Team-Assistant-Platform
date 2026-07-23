package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @Size(max = 150, message = "Task title must not exceed 150 characters.")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters.")
    private String description;

    @NotNull(message = "Task priority is required.")
    private TaskPriority priority;

    @FutureOrPresent(message = "Due date cannot be in the past.")
    private LocalDate dueDate;

    /**
     * Optional.
     * Task can remain unassigned during creation.
     */
    private Long assigneeId;

    /**
     * Optional.
     * Null means standalone task.
     */
    private Long ticketId;

}
