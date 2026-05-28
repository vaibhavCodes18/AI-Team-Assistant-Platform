package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
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
public class TicketRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Ticket title is required")
    @Size(max = 150, message = "Ticket title must not exceed 150 characters")
    private String title;

    private String description;

    @NotNull(message = "Ticket status is required")
    private TicketStatus status;

    @NotNull(message = "Ticket priority is required")
    private TicketPriority priority;

    private Long assigneeId;

    private LocalDate dueDate;
}
