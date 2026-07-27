package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import java.time.LocalDate;

import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryResponse {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private TicketType type;
    private TicketStatus status;
    private TicketPriority priority;
    private UserSummaryResponse reporterDetails;
    private LocalDate dueDate;
}
