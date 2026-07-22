package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketType;

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

    @Nullable
    @Size(max = 255, message = "Ticket description must not exceed 255 characters")
    private String description;

    @Nullable
    private TicketStatus status;

    @Nullable
    private TicketType type;

    @Nullable
    private TicketPriority priority;

    private LocalDate dueDate;
}
