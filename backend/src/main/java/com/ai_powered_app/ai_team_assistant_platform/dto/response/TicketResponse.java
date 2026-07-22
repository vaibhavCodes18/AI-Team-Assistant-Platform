package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private Long reporterId;
    private LocalDate dueDate;
}
