package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
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
public class TicketUpdateRequest {

    @Nullable
    @Size(max = 150, message = "Ticket title must not exceed 150 characters")
    private String title;

    private String description;

    @Nullable
    private TicketStatus status;

    @Nullable
    private TicketPriority priority;

    private String assigneeEmail;

    private LocalDate dueDate;
}
