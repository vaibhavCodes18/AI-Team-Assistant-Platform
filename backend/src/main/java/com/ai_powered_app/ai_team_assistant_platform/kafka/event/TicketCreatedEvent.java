package com.ai_powered_app.ai_team_assistant_platform.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreatedEvent {

    private Long ticketId;

    private String title;

    private Long projectId;

    private Long workspaceId;

    private Long createdByUserId;

    private LocalDate dueDate;
}
